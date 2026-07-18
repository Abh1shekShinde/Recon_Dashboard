"use client";
import { useState } from "react";

type DropZoneProps = {
  label: string;
  hint: string;
  file: File | null;
  onChange: (f: File | null) => void;
};

export default function DropZone({
  label,
  hint,
  file,
  onChange,
}: Readonly<DropZoneProps>) {
  const [isDragging, setIsDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped?.name?.toLowerCase()?.endsWith(".csv")) {
      onChange(dropped);
    }
  }

  if (file) {
    return (
      <div className="rounded-lg border border-gray-900 bg-gray-50 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {label}
          </p>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-gray-500 underline hover:text-gray-900"
          >
            Remove
          </button>
        </div>
        <p className="mt-2 truncate text-sm font-semibold text-gray-900">
          {file.name}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          {(file.size / 1024).toFixed(1)} KB — ready to upload
        </p>
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`flex min-h-33 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
        isDragging
          ? "border-gray-900 bg-gray-50"
          : "border-gray-300 hover:border-gray-500"
      }`}
    >
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-xs text-gray-400">{hint}</p>
      <p className="mt-2 text-xs text-gray-500 underline">
        Click to browse or drag a file here
      </p>
      <input
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </label>
  );
}
