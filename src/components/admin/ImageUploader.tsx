"use client";
import { useState } from "react";

export default function ImageUploader({
  onUploaded,
  label = "Subir foto desde tu computador",
}: {
  onUploaded: (url: string) => void;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUploaded(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo subir la foto.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <label className="btn-secondary cursor-pointer text-sm inline-flex">
        {loading ? "Subiendo…" : label}
        <input type="file" accept="image/*" className="hidden" onChange={handleChange} disabled={loading} />
      </label>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
