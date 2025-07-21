"use client";

import { Send as SendIcon, User, Bot, Search, FileText } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { sendResearchMessage } from "../lib/api";
import SourceApproval from "./SourceApproval";
import ArtifactRenderer from "./ArtifactRenderer";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ResearchResponse {
  messages: Message[];
  session_id: string;
  interrupt_type?: "source_approval" | "artifact_review";
  interrupt_data?: {
    sources?: Array<{
      document_id: string;
      title: string;
      relevance_score: number;
      reasoning: string;
      url: string;
    }>;
    artifacts?: Array<{
      id: string;
      title: string;
      type: string;
      content: string;
    }>;
    total_sources?: number;
    question?: string;
  };
  interrupt_id?: string;
}

interface ResearchInterfaceProps {
  sessionId: string;
  onBack: () => void;
  initialQuestion?: string;
}

export default function ResearchInterface({ sessionId, onBack, initialQuestion }: ResearchInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentInterrupt, setCurrentInterrupt] = useState<{
    type: string;
    data: any;
    id: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, currentInterrupt]);

  // Send initial question if provided (only once)
  useEffect(() => {
    if (initialQuestion) {
      sendMessage(initialQuestion);
    }
  }, []); // Only run once on mount // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading || sendingRef.current) {
      return;
    }

    const userMessage: Message = { role: "user", content };
    
    // Set flags first to prevent duplicate calls
    sendingRef.current = true;
    setIsLoading(true);
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Clear current interrupt when user sends a message
    setCurrentInterrupt(null);

    try {
      const response: ResearchResponse = await sendResearchMessage([userMessage], sessionId);
      
      // Add assistant messages from response
      if (response.messages) {
        const assistantMessages = response.messages.filter((msg: Message) => msg.role === "assistant");
        setMessages(prev => [...prev, ...assistantMessages]);
      }

      // Handle interrupts
      if (response.interrupt_type && response.interrupt_data) {
        setCurrentInterrupt({
          type: response.interrupt_type,
          data: response.interrupt_data,
          id: response.interrupt_id || ""
        });
      }
    } catch (error) {
      console.error("Error sending research message:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again."
      }]);
    } finally {
      setIsLoading(false);
      sendingRef.current = false;
    }
  };

  const handleSourceApproval = async (approvedIds: string[]) => {
    const approvalMessage = approvedIds.length === 0 ? 
      "none" : 
      approvedIds.length === currentInterrupt?.data.total_sources ? 
        "all" : 
        `approved: ${approvedIds.join(", ")}`;
    
    await sendMessage(approvalMessage);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-neutral-800">
        <button
          onClick={onBack}
          className="text-neutral-400 hover:text-neutral-100"
        >
          ← Back
        </button>
        <Search className="w-5 h-5 text-blue-500" />
        <h1 className="text-xl font-semibold">Legal Research Assistant</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-neutral-400 mt-8">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Ask me to research any legal topic in Uzbek law!</p>
            <p className="text-sm mt-2">I'll search for relevant sources and create comprehensive analysis documents.</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                <Search className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div
              className={`max-w-[70%] rounded-lg p-4 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-800 text-neutral-100"
              }`}
            >
              {/* Check for artifacts in assistant messages */}
              {message.role === "assistant" && message.content.includes("<artifact") ? (
                <ArtifactRenderer content={message.content} />
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>

            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Show interrupt UI */}
        {currentInterrupt && currentInterrupt.type === "source_approval" && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
              <Search className="w-4 h-4 text-white" />
            </div>
            <div className="bg-neutral-800 rounded-lg p-4 max-w-[70%]">
              <SourceApproval
                sources={currentInterrupt.data.sources || []}
                question={currentInterrupt.data.question || ""}
                onApprove={handleSourceApproval}
                isLoading={isLoading}
                noRelevantSources={currentInterrupt.data.no_relevant_sources || false}
                totalFound={currentInterrupt.data.total_found || 0}
              />
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
              <Search className="w-4 h-4 text-white" />
            </div>
            <div className="bg-neutral-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-neutral-400 text-sm ml-2">
                  {currentInterrupt ? "Processing..." : "Researching..."}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-neutral-800">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={currentInterrupt ? "Type your response..." : "Ask your research question..."}
            className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 outline-none focus:border-purple-500 placeholder-neutral-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-700 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}