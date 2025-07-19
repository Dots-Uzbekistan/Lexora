"use client";

import * as React from "react";

export default function NewProjectPage() {
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }
    // TODO: replace with actual creation logic
    alert(`Project \"${name.trim()}\" created!`);
    setName("");
    setError(null);
  };

  return (
    <div className="p-12 flex flex-col gap-12 max-w-5xl mx-auto">
      <h1 className="text-4xl sm:text-5xl font-semibold text-center sm:text-left">
        Create a New Project
      </h1>

      {/* Input bar similar to home quick question */}
      <div className="w-full max-w-2xl mx-auto sm:mx-0">
        <form
          onSubmit={handleCreate}
          className="flex items-center rounded-lg bg-neutral-900 border border-neutral-700 overflow-hidden"
        >
          <input
            type="text"
            placeholder="Project name"
            className="flex-1 bg-transparent px-4 py-3 outline-none placeholder-neutral-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-4 py-3 hover:bg-neutral-800 border-l border-neutral-700 disabled:opacity-50"
          >
            {/* Send icon (arrow) using lucide-react */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
} 