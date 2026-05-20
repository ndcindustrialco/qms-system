"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AnnouncementForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // 1. Upload file if exists
      let attachmentData = null;
      if (file) {
        const fileData = new FormData();
        fileData.append("file", file);
        fileData.append("path", "Announcements");
        
        const uploadRes = await fetch("/api/sharepoint/upload-file", {
          method: "POST",
          body: fileData,
        });
        
        if (!uploadRes.ok) throw new Error("Failed to upload file");
        attachmentData = await uploadRes.json();
      }

      // 2. Add attachment details to formData if uploaded
      if (attachmentData?.data) {
        formData.append("spItemId", attachmentData.data.id);
        formData.append("spWebUrl", attachmentData.data.webUrl);
        formData.append("spDownloadUrl", attachmentData.data["@microsoft.graph.downloadUrl"] || "");
        formData.append("fileName", file!.name);
        formData.append("mimeType", file!.type);
      }

      // 3. Create announcement via Server Action or API
      const createRes = await fetch("/api/announcements", {
        method: "POST",
        body: formData, // passing formData directly to a route handler
      });

      if (!createRes.ok) {
        throw new Error("Failed to save announcement");
      }

      router.push("/qms/announcements");
      router.refresh();

    } catch (error) {
      console.error(error);
      alert("Error creating announcement: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
      <div className="card-premium border border-base-300 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-base-200">
          <h2 className="text-sm md:text-base font-bold text-primary">Announcement Details</h2>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs md:text-sm font-semibold mb-2">Title <span className="text-error">*</span></label>
            <input type="text" name="title" required className="input input-bordered w-full text-sm" placeholder="Enter announcement title" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs md:text-sm font-semibold mb-2">Content <span className="text-error">*</span></label>
            <textarea name="content" required className="textarea textarea-bordered w-full h-32 text-sm" placeholder="Enter announcement content..."></textarea>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-semibold mb-2">Source System</label>
            <select name="sourceSystem" className="select select-bordered w-full text-sm">
              <option value="QMS">QMS</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="GA">GA</option>
              <option value="SAFETY">SAFETY</option>
            </select>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-semibold mb-2">Display Type</label>
            <select name="displayType" className="select select-bordered w-full text-sm">
              <option value="LIST">Standard List (Main Page)</option>
              <option value="SCROLLING">Scrolling Ticker (Top Bar)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-semibold mb-2">Start Date (Optional)</label>
            <input type="datetime-local" name="startDate" className="input input-bordered w-full text-sm" />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-semibold mb-2">End Date (Optional)</label>
            <input type="datetime-local" name="endDate" className="input input-bordered w-full text-sm" />
            <p className="text-[11px] md:text-xs text-gray-500 mt-1">Leave empty if no expiration.</p>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-3 p-4 border border-base-300 rounded-lg bg-base-200/30 cursor-pointer">
              <input type="checkbox" name="pushToCompanyCenter" value="true" defaultChecked className="checkbox checkbox-primary" />
              <div>
                <span className="text-xs md:text-sm font-semibold block">Push to Company Center</span>
                <span className="text-[11px] md:text-xs text-gray-500">Make this visible on the main dashboard page.</span>
              </div>
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs md:text-sm font-semibold mb-2">Attachment (Optional File / Image)</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="file-input file-input-bordered w-full text-sm"
            />
            {file && (
              <p className="text-[11px] md:text-xs text-primary mt-2 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-base-200">
          <button type="button" onClick={() => router.back()} className="btn btn-ghost btn-sm">Cancel</button>
          <button type="submit" disabled={loading} className="btn btn-primary btn-sm min-w-30">
            {loading ? <span className="loading loading-spinner loading-xs"></span> : "Publish Announcement"}
          </button>
        </div>
      </div>
    </form>
  );
}
