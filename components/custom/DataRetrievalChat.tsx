"use client";

import { useState, useRef, useEffect } from "react";
import { useAtomValue } from "jotai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { uploadedFilesAtom, EntityType } from "@/store/uploadAtoms";
import { dataRetrieval } from "@/app/actions/dataRetrieval";
import { useAIModifyTable } from "@/hooks/useAiDataModification";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
};

type ChatMode = "retrieval" | "modification";

interface DataRetrievalChatProps {
  currentTab?: string;
}

export default function DataRetrievalChat({
  currentTab = "clients",
}: DataRetrievalChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const [chatMode, setChatMode] = useState<ChatMode>("retrieval");

  const uploadedFiles = useAtomValue(uploadedFilesAtom);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current entity based on tab, default to clients if invalid
  const getCurrentEntity = (): EntityType => {
    if (
      currentTab === "clients" ||
      currentTab === "workers" ||
      currentTab === "tasks"
    ) {
      return currentTab as EntityType;
    }
    return "clients";
  };

  // Use data modification hook for the current entity
  const {
    runAIModification,
    applyChanges,
    rejectChanges,
    loading: modificationLoading,
    aiMessage,
    hasChanges,
    pendingChanges,
  } = useAIModifyTable(getCurrentEntity());

  // Check if current tab should disable data modification
  const isDataModificationDisabled =
    currentTab === "priorites" || currentTab === "rules";

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  // Cleanup streaming timeout on unmount
  useEffect(() => {
    return () => {
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current);
      }
    };
  }, []);

  // Stream text with delay
  const streamText = (text: string, messageId: string) => {
    let index = 0;
    setStreamingMessage("");

    const streamChar = () => {
      if (index < text.length) {
        setStreamingMessage(text.slice(0, index + 1));
        index++;
        streamingTimeoutRef.current = setTimeout(streamChar, 10); // 10ms delay per character
      } else {
        // Streaming complete, add to messages
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: text, streaming: false }
              : msg
          )
        );
        setStreamingMessage("");
        setIsLoading(false);
      }
    };

    streamChar();
  };

  const startChat = () => {
    setChatStarted(true);
    const initialMessage =
      chatMode === "retrieval"
        ? "Hello! I'm ready to help you analyze your data. What would you like to know about your clients, workers, and tasks?"
        : `Hello! I'm ready to help you modify your ${getCurrentEntity()} data. Tell me what changes you'd like to make and I'll help you implement them.`;

    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: initialMessage,
        streaming: false,
      },
    ]);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      streaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      if (chatMode === "retrieval") {
        // Data retrieval mode
        const allData = {
          clients:
            uploadedFiles.find((f) => f.entityType === "clients")?.rawData ||
            [],
          workers:
            uploadedFiles.find((f) => f.entityType === "workers")?.rawData ||
            [],
          tasks:
            uploadedFiles.find((f) => f.entityType === "tasks")?.rawData || [],
        };

        const response = await dataRetrieval({
          allData,
          userQuery: userMessage.content,
        });

        // Start streaming the response
        streamText(response, assistantMessage.id);
      } else {
        // Data modification mode
        await runAIModification(userMessage.content);

        // For modification mode, show immediate response
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? {
                  ...msg,
                  content:
                    "I'm processing your modification request. Please check the data modification panel for pending changes.",
                  streaming: false,
                }
              : msg
          )
        );
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error getting response:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content:
                  "Sorry, I encountered an error while processing your request. Please try again.",
                streaming: false,
              }
            : msg
        )
      );
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleModeChange = (mode: ChatMode) => {
    setChatMode(mode);
    // Reset chat when mode changes
    setChatStarted(false);
    setMessages([]);
    setInputValue("");
    setStreamingMessage("");
    if (streamingTimeoutRef.current) {
      clearTimeout(streamingTimeoutRef.current);
    }
  };

  return (
    <div className="h-[500px] flex flex-col bg-transparent">
      {/* Mode Selection - Fixed at top */}
      <div className="flex-shrink-0 p-4 border-b border-border/20">
        <div className="flex items-center gap-2 mb-3">
          <Badge
            variant={chatMode === "retrieval" ? "default" : "outline"}
            className="cursor-pointer px-3 py-1 text-xs"
            onClick={() => handleModeChange("retrieval")}
          >
            Data Retrieval
          </Badge>
          <Badge
            variant={chatMode === "modification" ? "default" : "outline"}
            className={`cursor-pointer px-3 py-1 text-xs ${
              isDataModificationDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() =>
              !isDataModificationDisabled && handleModeChange("modification")
            }
          >
            Data Modification
          </Badge>
        </div>
        {chatMode === "modification" && !isDataModificationDisabled && (
          <div className="text-xs text-muted-foreground">
            Currently modifying:{" "}
            <span className="font-medium capitalize">{getCurrentEntity()}</span>
          </div>
        )}
        {isDataModificationDisabled && chatMode === "modification" && (
          <div className="text-xs text-red-500">
            Data modification not available for current tab
          </div>
        )}
      </div>

      {!chatStarted ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <Button
              onClick={startChat}
              size="lg"
              className="px-8"
              disabled={
                uploadedFiles.length === 0 ||
                (chatMode === "modification" && isDataModificationDisabled)
              }
            >
              Start{" "}
              {chatMode === "retrieval" ? "Data Analysis" : "Data Modification"}{" "}
              Chat
            </Button>

            {uploadedFiles.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Please upload your data files first
              </p>
            )}
            {chatMode === "modification" && isDataModificationDisabled && (
              <p className="text-sm text-red-500">
                Data modification is not available for the current tab
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Chat Messages - Scrollable middle section */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full px-4">
              <div className="space-y-4 py-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 ${
                        message.role === "user"
                          ? "bg-blue-500 text-white shadow-sm"
                          : "bg-transparent text-foreground border border-border/20"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.streaming ? streamingMessage : message.content}
                        {message.streaming && (
                          <span className="animate-pulse ml-1">▋</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Data Modification Status - Above input */}
          {chatMode === "modification" && (aiMessage || hasChanges) && (
            <div className="flex-shrink-0 px-4 pb-2 space-y-2">
              {aiMessage && (
                <div className="p-3 bg-blue-50/50 border border-blue-200/50 text-sm">
                  <p className="text-blue-800 font-medium">AI Response:</p>
                  <p className="text-blue-700 mt-1">{aiMessage}</p>
                </div>
              )}

              {hasChanges && (
                <div className="p-3 bg-yellow-50/50 border border-yellow-200/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-800 text-sm font-medium">
                        Changes pending for {getCurrentEntity()}
                      </p>
                      <p className="text-yellow-700 text-xs mt-1">
                        Review changes in the data table and accept or reject
                        them.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={rejectChanges}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                      <Button
                        onClick={applyChanges}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input area - Fixed at bottom */}
          <div className="flex-shrink-0 p-4 border-t border-border/20">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  chatMode === "retrieval"
                    ? "Ask me anything about your data..."
                    : `Tell me what changes to make to ${getCurrentEntity()}...`
                }
                disabled={isLoading || modificationLoading}
                className="flex-1 border-border/30 bg-background/50"
              />
              <Button
                onClick={sendMessage}
                disabled={
                  isLoading || modificationLoading || !inputValue.trim()
                }
                size="sm"
              >
                {isLoading || modificationLoading ? "..." : "Send"}
              </Button>
            </div>

            {/* Reset chat button */}
            <div className="text-center mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setChatStarted(false);
                  setMessages([]);
                  setInputValue("");
                  setStreamingMessage("");
                  if (streamingTimeoutRef.current) {
                    clearTimeout(streamingTimeoutRef.current);
                  }
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Reset Chat
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
