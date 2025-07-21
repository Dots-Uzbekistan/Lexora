"use client";

import { Send as SendIcon } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import ChatInterface from "../components/ChatInterface";
import ResearchInterface from "../components/ResearchInterface";
import { createSession, createResearchSession } from "../lib/api";

const tools = [
  {
    label: "Smart Conclusion Engine",
    description:
      "Get instant legal insights. Our AI instantly analyzes legal texts or queries, conducts in-depth research, and delivers clear, evidence-backed conclusions—saving you hours of manual work.",
    gradient:
      "bg-gradient-to-br from-green-400/60 to-green-700/60 hover:from-green-400 hover:to-green-700",
  },
  {
    label: "Case to Action Plan",
    description:
      "Get a personalized, step-by-step legal action plan tailored to your case. Whether you're resolving a dispute, filing a claim, or navigating regulations, you'll know exactly what to do next.",
    gradient:
      "bg-gradient-to-br from-orange-400/60 to-orange-700/60 hover:from-orange-400 hover:to-orange-700",
  },
  {
    label: "Risk & Compliance assessment",
    description: "",
    comingSoon: true,
    gradient:
      "bg-gradient-to-br from-slate-800 to-slate-900 opacity-70 hover:opacity-100",
  },
];

export default function Home() {
  const [showChat, setShowChat] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleQuestionSubmit = async () => {
    if (!inputValue.trim()) return;
    
    try {
      // Create a new session for each new conversation
      const newSessionId = await createSession();
      setCurrentSessionId(newSessionId);
      setShowChat(true);
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleQuestionSubmit();
    }
  };

  const handleResearchToolClick = async () => {
    try {
      // Create a new research session
      const newSessionId = await createResearchSession();
      setCurrentSessionId(newSessionId);
      setShowResearch(true);
    } catch (error) {
      console.error("Failed to create research session:", error);
    }
  };

  const handleBackToHome = () => {
    setShowChat(false);
    setShowResearch(false);
    setInputValue("");
    setCurrentSessionId(null); // Clear session when going back
  };

  if (showResearch && currentSessionId) {
    return <ResearchInterface 
      sessionId={currentSessionId} 
      onBack={handleBackToHome}
    />;
  }

  if (showChat && currentSessionId) {
    return <ChatInterface 
      sessionId={currentSessionId} 
      onBack={handleBackToHome} 
      initialQuestion={inputValue}
    />;
  }

  return (
    <div className="p-12 flex flex-col gap-12 max-w-5xl mx-auto">
      <h1 className="text-4xl sm:text-5xl font-semibold text-center sm:text-left">
        Hello! How can I help you?
      </h1>

      {/* Quick question input */}
      <div className="w-full max-w-2xl mx-auto sm:mx-0">
        <div className="flex items-center rounded-lg bg-neutral-900 border border-neutral-700 overflow-hidden">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask quick question"
            className="flex-1 bg-transparent px-4 py-3 outline-none placeholder-neutral-500"
          />
          <button 
            onClick={handleQuestionSubmit}
            disabled={!inputValue.trim()}
            className="px-4 py-3 hover:bg-neutral-800 border-l border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Advanced tools */}
      <section className="flex flex-col gap-6">
        <h2 className="font-medium text-lg">Advanced Tools</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <button
              key={tool.label}
              disabled={tool.comingSoon}
              onClick={(tool.label === "Smart Conclusion Engine" || tool.label === "Case to Action Plan") ? handleResearchToolClick : undefined}
              className={`relative aspect-square rounded-lg p-4 text-left flex flex-col justify-end overflow-hidden ${
                tool.gradient
              } ${tool.comingSoon && "opacity-60 cursor-not-allowed"}`}
            >
              {tool.comingSoon && (
                <span className="absolute top-2 right-2 text-xs bg-neutral-900 text-neutral-100 py-0.5 px-2 rounded-full">
                  Coming Soon
                </span>
              )}
              <span className="text-xl font-semibold leading-tight max-w-[14ch]">
                {tool.label}
              </span>
              {tool.description && (
                <p className="mt-2 text-sm leading-snug text-neutral-200">
                  {tool.description}
                </p>
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
