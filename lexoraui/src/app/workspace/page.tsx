"use client";

import * as React from "react";
import {
  UploadCloud,
  Plus,
  CheckSquare,
  File,
  MessageCircle,
  Share2,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

export default function WorkspacePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!) ]);
      e.target.value = ""; // reset so same file can be selected again
    }
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 sm:p-10 flex flex-col gap-6 w-full h-full">
      <div className="flex-1 flex overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
        {/* Sources panel */}
        <aside className="w-56 sm:w-64 border-r border-neutral-800 flex flex-col">
          <header className="px-4 py-3 border-b border-neutral-800 text-sm font-semibold uppercase text-neutral-400 flex items-center justify-between">
            <span>Sources</span>
            <Plus className="w-4 h-4" />
          </header>
          <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex gap-2 items-center text-sm font-medium bg-neutral-950 border border-dashed border-neutral-700 rounded-lg px-3 py-2 hover:bg-neutral-800/60 transition"
            >
              <UploadCloud className="w-4 h-4" /> + Upload New Document
            </button>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleSelectFiles}
              className="hidden"
            />

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-blue-600" /> Select all
              sources
            </label>

            {files.length === 0 ? (
              <p className="text-neutral-600 text-xs">No sources added.</p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {files.map((file, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2"
                  >
                    <span className="truncate">
                      <File className="inline w-4 h-4 mr-1" /> {file.name}
                    </span>
                    <button onClick={() => handleRemove(idx)}>
                      <X className="w-4 h-4 text-neutral-500 hover:text-red-500" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Question / chat panel */}
        <main className="flex-1 border-r border-neutral-800 flex flex-col">
          <div className="flex-1 overflow-y-auto" />
          <div className="border-t border-neutral-800 p-4">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center rounded-lg bg-neutral-950 border border-neutral-700 overflow-hidden"
            >
              <input
                type="text"
                placeholder="What is the primary purpose and scope of the LEX.UZ database?"
                className="flex-1 bg-transparent px-4 py-3 outline-none placeholder-neutral-500 text-sm"
              />
              <button className="px-4 py-3 hover:bg-neutral-800 border-l border-neutral-700">
                <MessageCircle className="w-5 h-5" />
              </button>
            </form>
          </div>
        </main>

        {/* Answer panel */}
        <section className="w-72 sm:w-80 flex flex-col">
          <header className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between text-neutral-400 text-sm">
            <div className="flex items-center gap-2">
              <File className="w-4 h-4" />
              <span>Answer</span>
            </div>
            <div className="flex items-center gap-3">
              <Share2 className="w-4 h-4" />
              <CheckSquare className="w-4 h-4" />
            </div>
          </header>
          <div className="flex-1 p-4 overflow-y-auto">
            <p className="text-neutral-600 text-sm">No answer yet.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
