"use client";

import * as React from "react";
import { Search as SearchIcon } from "lucide-react";

interface Result {
  id: number;
  title: string;
  snippet: string;
}

export default function SearchPage() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Result[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setIsSearching(true);
    // Simulate async search API
    setTimeout(() => {
      const mock: Result[] = Array.from({ length: 5 }).map((_, idx) => ({
        id: idx,
        title: `Result ${idx + 1} for "${query}"`,
        snippet: "This is a placeholder snippet returned from search.",
      }));
      setResults(mock);
      setIsSearching(false);
    }, 800);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="p-12 flex flex-col gap-8 max-w-4xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-semibold text-center sm:text-left">
        Search
      </h1>

      <div className="flex items-center rounded-lg bg-neutral-900 border border-neutral-700 overflow-hidden">
        <input
          type="text"
          placeholder="Type keywords and press Enter"
          className="flex-1 bg-transparent px-4 py-3 outline-none placeholder-neutral-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-3 hover:bg-neutral-800 border-l border-neutral-700 disabled:opacity-50"
          disabled={!query.trim() || isSearching}
        >
          <SearchIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {isSearching && <p className="text-neutral-400">Searching...</p>}
        {!isSearching && results.length === 0 && (
          <p className="text-neutral-500">
            No results yet. Enter a query above.
          </p>
        )}
        {results.map((res) => (
          <div
            key={res.id}
            className="bg-neutral-900 border border-neutral-800 rounded-lg p-4"
          >
            <h3 className="font-medium mb-1">{res.title}</h3>
            <p className="text-sm text-neutral-400">{res.snippet}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
