import { useState, useRef } from "react";
import { UploadCloud, Link as LinkIcon, X, Loader2 } from "lucide-react";

export default function ImageUploadDropzone({
  value = "",
  onChange,
  label = "Image",
  placeholder = "https://...",
  disabled = false,
  helperText = "Drag & drop an image or paste a direct URL",
}) {
  const [activeTab, setActiveTab] = useState("file");
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef(null);

  const getBaseUrl = () => {
    const rawApiUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
    return rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`;
  };

  const uploadFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload a valid image file (PNG, JPG, WEBP, etc.).");
      return;
    }

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const token =
        localStorage.getItem("lumea_token") ||
        localStorage.getItem("token") ||
        "";

      const res = await fetch(`${getBaseUrl()}/upload`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to upload image.");
      }

      const imageUrl = data.url || data.secure_url || data.imageUrl || "";
      onChange(imageUrl);
    } catch (err) {
      setUploadError(err.message || "Upload failed. You can paste the direct link instead.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs uppercase tracking-luxe text-charcoal font-medium">
          {label}
        </label>
        <div className="flex items-center gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab("file")}
            className={`px-2 py-0.5 uppercase tracking-wider transition-colors ${
              activeTab === "file"
                ? "bg-charcoal text-ivory"
                : "text-charcoal-soft hover:text-charcoal"
            }`}
          >
            Upload / Drag
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`px-2 py-0.5 uppercase tracking-wider transition-colors ${
              activeTab === "url"
                ? "bg-charcoal text-ivory"
                : "text-charcoal-soft hover:text-charcoal"
            }`}
          >
            Direct Link
          </button>
        </div>
      </div>

      {value ? (
        <div className="relative border border-charcoal/20 bg-ivory p-3 flex items-center gap-4">
          <img
            src={value}
            alt="Preview"
            className="w-16 h-16 object-cover bg-cream border border-charcoal/10"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-charcoal truncate font-mono">{value}</p>
            <p className="text-[11px] text-emerald-700 mt-0.5">Image selected</p>
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={disabled}
            className="p-1.5 text-charcoal-soft hover:text-rose transition-colors"
            title="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      ) : activeTab === "file" ? (
        <div>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !uploading && inputRef.current?.click()}
            className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
              dragActive
                ? "border-rose bg-rose/5"
                : "border-charcoal/20 bg-ivory/50 hover:border-charcoal/40"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={disabled || uploading}
              onChange={(e) => {
                if (e.target.files?.[0]) uploadFile(e.target.files[0]);
              }}
            />
            {uploading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-2">
                <Loader2 size={24} className="animate-spin text-charcoal" />
                <span className="text-xs text-charcoal-soft">Uploading image...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                <UploadCloud size={24} className="text-charcoal-soft" />
                <p className="text-xs text-charcoal">
                  <span className="font-medium underline">Click to upload</span> or drag and drop
                </p>
                <p className="text-[11px] text-charcoal-soft">{helperText}</p>
              </div>
            )}
          </div>
          {uploadError && <p className="mt-1.5 text-xs text-rose-dark">{uploadError}</p>}
        </div>
      ) : (
        <div>
          <div className="relative">
            <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-soft" />
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              placeholder={placeholder}
              className="w-full border border-charcoal/20 bg-ivory pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-rose font-mono"
            />
          </div>
        </div>
      )}
    </div>
  );
}
