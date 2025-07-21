"use client";

import { Send as SendIcon, User, Bot } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../lib/api";
import MessageRenderer from "./MessageRenderer";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  sessionId: string;
  onBack: () => void;
  initialQuestion?: string;
}

export default function ChatInterface({ sessionId, onBack, initialQuestion }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

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

    try {
      const response = await sendChatMessage([userMessage], sessionId);
      
      // Add assistant messages from response
      if (response.messages) {
        const assistantMessages = response.messages.filter((msg: Message) => msg.role === "assistant");
        setMessages(prev => [...prev, ...assistantMessages]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again."
      }]);
    } finally {
      setIsLoading(false);
      sendingRef.current = false;
    }
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
        <h1 className="text-xl font-semibold">Legal Consultation Agent </h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-neutral-400 mt-8">
            <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Ask me any legal question about Uzbek law!</p>
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
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div
              className={`max-w-[70%] rounded-lg p-4 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-800 text-neutral-100"
              }`}
            >
              {message.role === "assistant" ? (
                <MessageRenderer content={message.content} />
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

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-neutral-800 rounded-lg p-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
            placeholder="Ask your legal question..."
            className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500 placeholder-neutral-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}