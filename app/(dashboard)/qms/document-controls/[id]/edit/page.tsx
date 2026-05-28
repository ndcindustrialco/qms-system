import { redirect } from 'next/navigation';

type Params = Promise<{ id: string }>;

export default async function EditDocumentControlPage(props: { params: Params }) {
  const { id } = await props.params;
  redirect(`/qms/document-controls/${id}`);
}
