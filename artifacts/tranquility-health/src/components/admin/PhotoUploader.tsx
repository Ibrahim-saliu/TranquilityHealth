/**
 * PhotoUploader — inline photo upload control for provider profiles.
 *
 * Shows the current image (or an initial-avatar placeholder), a click / drag-drop
 * zone, client-side validation (JPEG/PNG/WebP ≤ 5 MB), and the two-step presigned
 * URL upload flow with a server-side finalize call that verifies real GCS metadata
 * before the objectPath is committed to form state.
 *
 * Calls `onChange` with the confirmed objectPath after finalization succeeds.
 */

import { useRef, useState } from "react";
import { API_BASE_URL } from "@/lib/config/env";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/** Construct the serving URL from an objectPath or legacy https URL. */
export function resolvePhotoSrc(value: string | null | undefined): string | null {
  if (!value) return null;
  // Full URL (legacy or external)
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  // objectPath stored by us — build the API serving URL
  if (value.startsWith("/objects/")) return `${API_BASE_URL}/storage${value}`;
  return value;
}

interface PhotoUploaderProps {
  /** Current stored value — objectPath or legacy URL; null / "" for none. */
  value: string;
  /** Called with the confirmed objectPath after a successful upload + finalization. */
  onChange: (objectPath: string) => void;
  /** Initials shown in the placeholder avatar. */
  initials?: string;
  /** Additional wrapper class. */
  className?: string;
}

export function PhotoUploader({ value, onChange, initials = "?", className = "" }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const displaySrc = localPreview ?? resolvePhotoSrc(value);

  async function handleFile(file: File) {
    setUploadError(null);

    // Client-side pre-validation (advisory; server enforces again after upload)
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError("Only JPEG, PNG, and WebP images are accepted.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setUploadError("Image must be 5 MB or smaller.");
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    setLocalPreview(blobUrl);
    setUploading(true);

    try {
      // Step 1 — Request presigned URL from API server (session cookie included)
      const urlRes = await fetch(`${API_BASE_URL}/storage/uploads/request-url`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });

      if (!urlRes.ok) {
        const body = await urlRes.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `HTTP ${urlRes.status}`);
      }

      const { uploadURL, objectPath } = (await urlRes.json()) as {
        uploadURL: string;
        objectPath: string;
      };

      // Step 2 — Upload directly to GCS via the presigned URL
      const putRes = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!putRes.ok) throw new Error("Failed to upload image to storage.");

      // Step 3 — Finalize: server verifies the actual GCS object metadata
      // (content type and byte size) against allowed limits; deletes if invalid.
      const finalizeRes = await fetch(`${API_BASE_URL}/storage/uploads/finalize`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectPath }),
      });

      if (!finalizeRes.ok) {
        const body = await finalizeRes.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Upload verification failed.");
      }

      onChange(objectPath);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
      setLocalPreview(null);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(blobUrl);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Avatar preview */}
      <div className="relative">
        {displaySrc ? (
          <img
            src={displaySrc}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-slate-200"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold border-2 border-slate-200">
            {initials.charAt(0).toUpperCase()}
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Drop / click zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload profile photo"
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`w-full border-2 border-dashed rounded-lg px-4 py-3 text-center text-sm transition-colors select-none cursor-pointer
          ${uploading
            ? "border-slate-200 text-slate-400 cursor-not-allowed"
            : "border-slate-300 text-slate-500 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50"
          }`}
      >
        {uploading ? (
          <span>Uploading…</span>
        ) : (
          <>
            <span className="font-medium">Click to upload</span>
            <span className="hidden sm:inline"> or drag &amp; drop</span>
            <br />
            <span className="text-xs text-slate-400">JPEG · PNG · WebP · max 5 MB</span>
          </>
        )}
      </div>

      {uploadError && (
        <p className="text-xs text-red-600 font-medium w-full">{uploadError}</p>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleInputChange}
        disabled={uploading}
      />
    </div>
  );
}
