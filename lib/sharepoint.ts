import { Client } from "@microsoft/microsoft-graph-client";

async function getAccessToken(): Promise<string> {
  const tenantId = process.env.AZURE_AD_TENANT_ID!;
  const clientId = process.env.AZURE_AD_CLIENT_ID!;
  const clientSecret = process.env.AZURE_AD_CLIENT_SECRET!;

  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
    scope: "https://graph.microsoft.com/.default",
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to acquire access token: ${res.status} ${errorText}`);
  }

  const data = await res.json() as { access_token: string };
  return data.access_token;
}

export async function getGraphClient(): Promise<Client> {
  const token = await getAccessToken();
  return Client.init({
    authProvider: (done) => done(null, token),
  });
}

const SITE_ID = process.env.SHAREPOINT_SITE_ID!;

export type SpFile = {
  id: string;
  name: string;
  size: number;
  lastModifiedDateTime: string;
  webUrl: string;
  file?: { mimeType: string };
  folder?: { childCount: number };
  parentReference?: { path: string };
};

export async function createFolder(folderName: string, parentPath = "root"): Promise<SpFile> {
  const client = await getGraphClient();
  const endpoint =
    parentPath === "root"
      ? `/sites/${SITE_ID}/drive/root/children`
      : `/sites/${SITE_ID}/drive/root:/${parentPath}:/children`;

  return client.api(endpoint).post({
    name: folderName,
    folder: {},
    "@microsoft.graph.conflictBehavior": "rename",
  });
}

export async function uploadFile(
  fileName: string,
  fileBuffer: Buffer,
  folderPath = "root"
): Promise<SpFile> {
  const client = await getGraphClient();
  const endpoint =
    folderPath === "root"
      ? `/sites/${SITE_ID}/drive/root:/${fileName}:/content`
      : `/sites/${SITE_ID}/drive/root:/${folderPath}/${fileName}:/content`;

  return client.api(endpoint).put(fileBuffer);
}

export async function listFiles(folderPath = "root"): Promise<SpFile[]> {
  const client = await getGraphClient();
  const endpoint =
    folderPath === "root"
      ? `/sites/${SITE_ID}/drive/root/children`
      : `/sites/${SITE_ID}/drive/root:/${folderPath}:/children`;

  const result = await client.api(endpoint).get();
  return result.value ?? [];
}

export type FileInfo = {
  downloadUrl: string;
  webUrl: string;
  name: string;
  mimeType: string;
};

// @microsoft.graph.downloadUrl is an OData annotation — Graph omits it when
// $select is present (even if listed). Fetch without $select to get all fields.
export async function getFileInfo(itemId: string): Promise<FileInfo> {
  const token = await getAccessToken();
  const url = `https://graph.microsoft.com/v1.0/sites/${SITE_ID}/drive/items/${itemId}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph API error ${res.status}: ${text}`);
  }
  const item = await res.json();
  return {
    downloadUrl: item["@microsoft.graph.downloadUrl"] ?? "",
    webUrl: item.webUrl,
    name: item.name,
    mimeType: item.file?.mimeType ?? "",
  };
}

export async function getFileStream(
  itemId: string
): Promise<{ stream: ReadableStream; contentType: string; name: string }> {
  const info = await getFileInfo(itemId);
  if (!info.downloadUrl) throw new Error("No download URL returned from Graph API");
  const res = await fetch(info.downloadUrl);
  if (!res.ok) throw new Error(`Failed to fetch file: ${res.status}`);
  return {
    stream: res.body!,
    contentType: res.headers.get("content-type") ?? info.mimeType,
    name: info.name,
  };
}

export async function deleteItem(itemId: string): Promise<void> {
  const client = await getGraphClient();
  await client.api(`/sites/${SITE_ID}/drive/items/${itemId}`).delete();
}

// Returns a short-lived embed URL for Office files via the Graph /preview endpoint.
export async function getOfficePreviewUrl(itemId: string): Promise<string> {
  const client = await getGraphClient();
  const result = await client
    .api(`/sites/${SITE_ID}/drive/items/${itemId}/preview`)
    .post({});
  return result.getUrl as string;
}
