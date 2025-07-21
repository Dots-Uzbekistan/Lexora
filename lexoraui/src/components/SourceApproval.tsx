"use client";

import { useState } from "react";
import { CheckCircle, Circle, ExternalLink, Star } from "lucide-react";

interface Source {
  document_id: string;
  title: string;
  relevance_score: number;
  reasoning: string;
  url: string;
}

interface SourceApprovalProps {
  sources: Source[];
  question: string;
  onApprove: (approvedIds: string[]) => void;
  isLoading?: boolean;
  noRelevantSources?: boolean;
  totalFound?: number;
}

export default function SourceApproval({ sources, question, onApprove, isLoading = false, noRelevantSources = false, totalFound = 0 }: SourceApprovalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = (documentId: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(documentId)) {
      newSelection.delete(documentId);
    } else {
      newSelection.add(documentId);
    }
    setSelectedIds(newSelection);
  };

  const selectAll = () => {
    setSelectedIds(new Set(sources.map(s => s.document_id)));
  };

  const selectNone = () => {
    setSelectedIds(new Set());
  };

  const handleApprove = () => {
    onApprove(Array.from(selectedIds));
  };

  const handleRetrySearch = () => {
    onApprove(["retry"]);
  };

  const handleBroadenSearch = () => {
    onApprove(["broaden"]);
  };

  const handleProceedAnyway = () => {
    onApprove(["proceed"]);
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return "text-green-400";
    if (score >= 0.6) return "text-yellow-400";
    return "text-orange-400";
  };

  const getRelevanceLabel = (score: number) => {
    if (score >= 0.8) return "High";
    if (score >= 0.6) return "Medium";
    return "Low";
  };

  if (noRelevantSources) {
    return (
      <div className="space-y-4">
        {/* Header for no sources */}
        <div className="border-b border-neutral-700 pb-3">
          <h3 className="text-lg font-semibold text-neutral-100 mb-2">
            No Relevant Sources Found
          </h3>
          <p className="text-sm text-neutral-300 mb-3">
            I searched and found {totalFound} sources for: <span className="italic">"{question}"</span>, but none were sufficiently relevant.
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <p className="text-sm text-neutral-200">What would you like me to do?</p>
          
          <div className="space-y-2">
            <button
              onClick={handleRetrySearch}
              disabled={isLoading}
              className="w-full p-3 text-left bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <span className="font-medium text-neutral-100">1. Try a different search approach</span>
              <p className="text-xs text-neutral-400 mt-1">Use alternative keywords and search strategies</p>
            </button>
            
            <button
              onClick={handleBroadenSearch}
              disabled={isLoading}
              className="w-full p-3 text-left bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <span className="font-medium text-neutral-100">2. Broaden the search criteria</span>
              <p className="text-xs text-neutral-400 mt-1">Lower the relevance threshold to include more sources</p>
            </button>
            
            <button
              onClick={handleProceedAnyway}
              disabled={isLoading}
              className="w-full p-3 text-left bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <span className="font-medium text-neutral-100">3. Proceed with best available sources</span>
              <p className="text-xs text-neutral-400 mt-1">Use the highest-scoring sources despite low relevance</p>
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 p-3">
            <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-neutral-400 text-sm">Processing your choice...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-neutral-700 pb-3">
        <h3 className="text-lg font-semibold text-neutral-100 mb-2">
          Review Found Sources
        </h3>
        <p className="text-sm text-neutral-300 mb-3">
          Found {sources.length} relevant sources for: <span className="italic">"{question}"</span>
        </p>
        
        {/* Selection controls */}
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            disabled={isLoading}
            className="px-3 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-800 disabled:cursor-not-allowed text-neutral-200 rounded transition-colors"
          >
            Select All
          </button>
          <button
            onClick={selectNone}
            disabled={isLoading}
            className="px-3 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-800 disabled:cursor-not-allowed text-neutral-200 rounded transition-colors"
          >
            Select None
          </button>
        </div>
      </div>

      {/* Sources list */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sources.map((source, index) => (
          <div
            key={source.document_id}
            className={`border rounded-lg p-3 cursor-pointer transition-all ${
              selectedIds.has(source.document_id)
                ? "border-blue-500 bg-blue-900/20"
                : "border-neutral-700 hover:border-neutral-600"
            }`}
            onClick={() => !isLoading && toggleSelection(source.document_id)}
          >
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <div className="mt-1">
                {selectedIds.has(source.document_id) ? (
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                ) : (
                  <Circle className="w-5 h-5 text-neutral-400" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title and relevance */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-medium text-neutral-100 text-sm leading-tight">
                    {index + 1}. {source.title}
                  </h4>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Star className={`w-3 h-3 ${getRelevanceColor(source.relevance_score)}`} />
                    <span className={`text-xs font-medium ${getRelevanceColor(source.relevance_score)}`}>
                      {getRelevanceLabel(source.relevance_score)}
                    </span>
                    <span className="text-xs text-neutral-400">
                      ({source.relevance_score.toFixed(2)})
                    </span>
                  </div>
                </div>

                {/* Reasoning */}
                <p className="text-xs text-neutral-300 mb-2 italic">
                  {source.reasoning}
                </p>

                {/* Document ID and URL */}
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>ID: {source.document_id}</span>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Source
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="border-t border-neutral-700 pt-3 flex gap-2">
        <button
          onClick={handleApprove}
          disabled={isLoading}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            selectedIds.size > 0
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
          } disabled:bg-neutral-800 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </div>
          ) : (
            `Approve Selected (${selectedIds.size})`
          )}
        </button>
        
        <button
          onClick={() => onApprove([])}
          disabled={isLoading}
          className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-800 disabled:cursor-not-allowed text-neutral-200 rounded-lg text-sm transition-colors"
        >
          Skip All
        </button>
      </div>

      {/* Help text */}
      <p className="text-xs text-neutral-400 text-center">
        Select sources you want me to analyze for your research. I'll use the approved sources to create a comprehensive legal analysis.
      </p>
    </div>
  );
}