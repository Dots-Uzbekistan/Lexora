import React from 'react';

interface MessageRendererProps {
  content: string;
}

export default function MessageRenderer({ content }: MessageRendererProps) {
  // Parse markdown-style links [text](url) and convert to JSX
  const parseLinks = (text: string) => {
    // Regex to match [text](url) pattern
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Add the link
      const linkText = match[1];
      const linkUrl = match[2];
      
      parts.push(
        <a
          key={`link-${match.index}`}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
        >
          {linkText}
        </a>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after the last link
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  const renderContent = () => {
    return parseLinks(content).map((part, index) => {
      if (typeof part === 'string') {
        // Split by newlines and render each line
        return part.split('\n').map((line, lineIndex, array) => (
          <React.Fragment key={`${index}-${lineIndex}`}>
            {line}
            {lineIndex < array.length - 1 && <br />}
          </React.Fragment>
        ));
      }
      return part;
    });
  };

  return <div className="whitespace-pre-wrap">{renderContent()}</div>;
}