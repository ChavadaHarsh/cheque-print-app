"use client";

import { FormEvent, useState } from "react";

type UploadedPayload = {
  imageUrl: string;
  bankId: string;
  bankName: string;
};

type Props = {
  bankId: string;
  bankName: string;
  onUploaded: (payload: UploadedPayload) => void;
};

export function ImageUploader({ bankId, bankName, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!bankId || !bankName) {
      setError("Please select a bank first.");
      return;
    }
    if (!file) {
      setError("Please choose an image to upload.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error || "Upload failed.");
        return;
      }

      onUploaded({
        imageUrl: payload.imageUrl as string,
        bankId,
        bankName,
      });
    } catch {
      setError("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <label className="block text-sm font-medium text-slate-700">Upload Cheque Image</label>
      <input
        type="file"
        accept="image/*"
        onChange={(event) => {
          setFile(event.target.files?.[0] || null);
          setError("");
        }}
        className="w-full rounded-lg border border-slate-300 bg-white p-2"
      />
      <button
        type="submit"
        disabled={isUploading || !file}
        className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {isUploading ? "Uploading..." : "Upload Image"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
