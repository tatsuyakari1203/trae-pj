"use client";

import { useState } from "react";
import { Toaster, toast } from "sonner";
import SpotlightCard from "./SpotlightCard";

interface UploadFormProps {
  onSubmit: (data: { image: File; text: string }) => void;
}

export function UploadForm({ onSubmit }: UploadFormProps) {
  const [image, setImage] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      toast.success("Image uploaded successfully!");
    } else {
      toast.error("Please upload a valid image file");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) {
      toast.error("Please upload an image");
      return;
    }

    if (!text.trim()) {
      toast.error("Please provide some information about yourself");
      return;
    }

    onSubmit({ image, text });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Toaster position="top-center" />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Image Upload */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Upload Your Photo (Selfie or any photo)
          </label>

          <SpotlightCard className="rounded-sm bg-[var(--card)] border border-[var(--border)] overflow-hidden">
            <div
              className={`p-10 text-center transition-all duration-300 ${
                isDragging ? "bg-[var(--accent)]/10" : ""
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
            >
              {image ? (
                <div className="space-y-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    className="max-w-xs max-h-48 mx-auto rounded-sm shadow-soft"
                  />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="text-[var(--muted)] hover:opacity-80 text-sm font-mono"
                  >
                    [ Remove image ]
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-[var(--background)] rounded-sm flex items-center justify-center border border-[var(--border)]">
                    <svg className="w-6 h-6 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[var(--muted)] font-mono text-sm">
                      Drop your image here, or{" "}
                      <label className="text-[var(--accent)] hover:opacity-80 cursor-pointer underline decoration-dashed">
                        browse
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImageUpload(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </p>
                    <p className="text-xs text-[var(--muted)] opacity-70 font-mono">
                      Supports JPG, PNG, WEBP
                    </p>
                  </div>
                </div>
              )}
            </div>
          </SpotlightCard>
        </div>

        {/* Text Input */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-mono">
            Tell us about yourself
          </label>
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="I'm a software engineer based in Tokyo..."
              className="w-full h-32 px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-sm focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none resize-none transition-all font-mono text-sm"
            />
            <div className="absolute bottom-3 right-3 text-xs text-[var(--muted)] font-mono">
              {text.length} chars
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-12 text-lg"
          disabled={!image || !text}
        >
          {/* Pixel-style arrow */}
          <span className="mr-2">Generate Portfolio</span>
          <span className="font-mono">{`->`}</span>
        </button>
      </form>
    </div>
  );
}
