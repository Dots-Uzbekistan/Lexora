// API configuration and functions for QNA and Research services

const API_BASE_URL = "https://backend.lexora.uz/api/v1";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: Message[];
  session_id: string;
}

export interface ChatResponse {
  messages: Message[];
  session_id: string;
}

// Extended interface for Research service with interrupt handling
export interface ResearchResponse extends ChatResponse {
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

export interface SessionResponse {
  session_id: string;
}

// Create a new chat session
export async function createSession(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/qna/chat/new-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.status}`);
    }

    const data: SessionResponse = await response.json();
    return data.session_id;
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
}

// Send a chat message
export async function sendChatMessage(
  messages: Message[],
  sessionId: string
): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/qna/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.status}`);
    }

    const data: ChatResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
}

// Get chat history for a session
export async function getChatHistory(sessionId: string): Promise<Message[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/qna/chat/${sessionId}/history`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get history: ${response.status}`);
    }

    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    console.error("Error getting chat history:", error);
    throw error;
  }
}

// Clear chat history for a session
export async function clearChatHistory(sessionId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/qna/chat/${sessionId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to clear history: ${response.status}`);
    }
  } catch (error) {
    console.error("Error clearing chat history:", error);
    throw error;
  }
}

// ===== RESEARCH SERVICE FUNCTIONS =====

// Create a new research session
export async function createResearchSession(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/research/chat/new-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to create research session: ${response.status}`);
    }

    const data: SessionResponse = await response.json();
    return data.session_id;
  } catch (error) {
    console.error("Error creating research session:", error);
    throw error;
  }
}

// Send a research message
export async function sendResearchMessage(
  messages: Message[],
  sessionId: string
): Promise<ResearchResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/research/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Research request failed: ${response.status}`);
    }

    const data: ResearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending research message:", error);
    throw error;
  }
}

// Get research chat history for a session
export async function getResearchHistory(sessionId: string): Promise<Message[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/research/chat/${sessionId}/history`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get research history: ${response.status}`);
    }

    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    console.error("Error getting research history:", error);
    throw error;
  }
}

// Clear research chat history for a session
export async function clearResearchHistory(sessionId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/research/chat/${sessionId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to clear research history: ${response.status}`);
    }
  } catch (error) {
    console.error("Error clearing research history:", error);
    throw error;
  }
}