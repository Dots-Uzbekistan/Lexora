"use client";

import { useState } from "react";
import { FileText, Download, Copy, Eye, EyeOff } from "lucide-react";

interface ArtifactData {
  command: string;
  artifact_id: string;
  title?: string;
  type?: string;
  stage?: string;
  content: string;
}

interface ArtifactRendererProps {
  content: string;
}

export default function ArtifactRenderer({ content }: ArtifactRendererProps) {
  const [expandedArtifacts, setExpandedArtifacts] = useState<Set<string>>(new Set());
  const [copiedArtifacts, setCopiedArtifacts] = useState<Set<string>>(new Set());

  // Parse XML artifacts from content
  const parseArtifacts = (text: string): ArtifactData[] => {
    const artifacts: ArtifactData[] = [];
    const artifactRegex = /<artifact\s+([^>]+)>([\s\S]*?)<\/artifact>/g;
    
    let match;
    while ((match = artifactRegex.exec(text)) !== null) {
      const attributesStr = match[1];
      const content = match[2].trim();
      
      // Parse attributes
      const attributes: Record<string, string> = {};
      const attrRegex = /(\w+)="([^"]*)"/g;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(attributesStr)) !== null) {
        attributes[attrMatch[1]] = attrMatch[2];
      }
      
      artifacts.push({
        command: attributes.command || 'create',
        artifact_id: attributes.artifact_id || `artifact_${Date.now()}`,
        title: attributes.title,
        type: attributes.type,
        stage: attributes.stage,
        content
      });
    }
    
    return artifacts;
  };

  const toggleExpanded = (artifactId: string) => {
    const newExpanded = new Set(expandedArtifacts);
    if (newExpanded.has(artifactId)) {
      newExpanded.delete(artifactId);
    } else {
      newExpanded.add(artifactId);
    }
    setExpandedArtifacts(newExpanded);
  };

  const copyToClipboard = async (artifactId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedArtifacts(new Set([...copiedArtifacts, artifactId]));
      setTimeout(() => {
        setCopiedArtifacts(prev => {
          const newSet = new Set(prev);
          newSet.delete(artifactId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadArtifact = (artifact: ArtifactData) => {
    const blob = new Blob([artifact.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.title || artifact.artifact_id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTypeIcon = (type?: string) => {
    return <FileText className="w-4 h-4" />;
  };

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'legal_analysis':
        return 'text-blue-400 border-blue-500';
      case 'case_analysis':
        return 'text-green-400 border-green-500';
      case 'research_report':
        return 'text-purple-400 border-purple-500';
      default:
        return 'text-neutral-400 border-neutral-500';
    }
  };

  const getStageColor = (stage?: string) => {
    switch (stage) {
      case 'draft':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-500';
      case 'review':
        return 'bg-orange-600/20 text-orange-400 border-orange-500';
      case 'final':
        return 'bg-green-600/20 text-green-400 border-green-500';
      default:
        return 'bg-neutral-600/20 text-neutral-400 border-neutral-500';
    }
  };

  const artifacts = parseArtifacts(content);

  // If no artifacts found, render content normally
  if (artifacts.length === 0) {
    return <p className="whitespace-pre-wrap">{content}</p>;
  }

  // Remove artifact XML from main content
  let mainContent = content;
  artifacts.forEach(() => {
    mainContent = mainContent.replace(/<artifact\s+[^>]+>[\s\S]*?<\/artifact>/g, '').trim();
  });

  return (
    <div className="space-y-4">
      {/* Main content (if any) */}
      {mainContent && (
        <div className="whitespace-pre-wrap">{mainContent}</div>
      )}

      {/* Rendered artifacts */}
      {artifacts.map((artifact) => {
        const isExpanded = expandedArtifacts.has(artifact.artifact_id);
        const isCopied = copiedArtifacts.has(artifact.artifact_id);
        
        return (
          <div
            key={artifact.artifact_id}
            className={`border rounded-lg overflow-hidden ${getTypeColor(artifact.type)}`}
          >
            {/* Header */}
            <div className="bg-neutral-900/50 border-b border-current/20 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(artifact.type)}
                  <div>
                    <h4 className="font-medium text-sm">
                      {artifact.title || `Document ${artifact.artifact_id}`}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {artifact.type && (
                        <span className="text-xs px-2 py-1 rounded bg-current/10 border border-current/30">
                          {artifact.type.replace('_', ' ')}
                        </span>
                      )}
                      {artifact.stage && (
                        <span className={`text-xs px-2 py-1 rounded border ${getStageColor(artifact.stage)}`}>
                          {artifact.stage}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => copyToClipboard(artifact.artifact_id, artifact.content)}
                    className="p-1.5 hover:bg-current/10 rounded transition-colors"
                    title="Copy content"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => downloadArtifact(artifact)}
                    className="p-1.5 hover:bg-current/10 rounded transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleExpanded(artifact.artifact_id)}
                    className="p-1.5 hover:bg-current/10 rounded transition-colors"
                    title={isExpanded ? "Collapse" : "Expand"}
                  >
                    {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              {isCopied && (
                <p className="text-xs text-green-400 mt-2">✓ Copied to clipboard</p>
              )}
            </div>

            {/* Content */}
            <div className={`transition-all duration-200 ${isExpanded ? 'max-h-none' : 'max-h-32 overflow-hidden'}`}>
              <div className="p-4 bg-neutral-900/20">
                <pre className="whitespace-pre-wrap text-sm font-mono text-neutral-100 leading-relaxed">
                  {artifact.content}
                </pre>
                
                {!isExpanded && artifact.content.length > 200 && (
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-neutral-900/20 to-transparent pointer-events-none" />
                )}
              </div>
            </div>

            {/* Expand button for collapsed content */}
            {!isExpanded && artifact.content.length > 200 && (
              <div className="border-t border-current/20 bg-neutral-900/30">
                <button
                  onClick={() => toggleExpanded(artifact.artifact_id)}
                  className="w-full py-2 text-xs hover:bg-current/10 transition-colors"
                >
                  Click to expand full content...
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}