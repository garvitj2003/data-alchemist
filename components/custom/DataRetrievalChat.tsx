"use client";

import { useState, useRef, useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { uploadedFilesAtom, validationErrorsAtom } from "@/store/uploadAtoms";
import { dataRetrieval } from "@/app/actions/dataRetrieval";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
};

export default function DataRetrievalChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>("");

  const uploadedFiles = useAtomValue(uploadedFilesAtom);
  const validationErrors = useAtomValue(validationErrorsAtom);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if there are any validation errors
  const hasErrors = Object.values(validationErrors).some(
    (entityErrors) => entityErrors && Object.keys(entityErrors).length > 0
  );

  // Count total errors
  const totalErrors = Object.values(validationErrors).reduce(
    (total, entityErrors) => {
      if (!entityErrors) return total;
      return (
        total +
        Object.values(entityErrors).reduce(
          (entityTotal, rowErrors) =>
            entityTotal + Object.keys(rowErrors).length,
          0
        )
      );
    },
    0
  );

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
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "Hello! I'm ready to help you analyze your data. What would you like to know about your clients, workers, and tasks?",
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
      // Prepare data for the action
      const allData = {
        clients:
          uploadedFiles.find((f) => f.entityType === "clients")?.rawData || [],
        workers:
          uploadedFiles.find((f) => f.entityType === "workers")?.rawData || [],
        tasks:
          uploadedFiles.find((f) => f.entityType === "tasks")?.rawData || [],
      };

      const response = await dataRetrieval({
        allData,
        userQuery: userMessage.content,
      });

      // Start streaming the response
      streamText(response, assistantMessage.id);
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

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Data Analysis Chat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!chatStarted ? (
            <div className="text-center space-y-4">
              {/* Status message */}
              <div className="p-4 rounded-lg border">
                {hasErrors ? (
                  <div className="text-red-600">
                    <div className="font-medium">
                      ⚠️ Errors detected in your data
                    </div>
                    <div className="text-sm mt-1">
                      Found {totalErrors} validation error
                      {totalErrors !== 1 ? "s" : ""} across your tables. Please
                      fix these issues before starting the chat for more
                      accurate analysis.
                    </div>
                  </div>
                ) : (
                  <div className="text-green-600">
                    <div className="font-medium">✅ Good to go!</div>
                    <div className="text-sm mt-1">
                      Your data looks clean and ready for analysis.
                    </div>
                  </div>
                )}
              </div>

              {/* Start chat button */}
              <Button
                onClick={startChat}
                size="lg"
                className="px-8"
                disabled={uploadedFiles.length === 0}
              >
                Start Data Analysis Chat
              </Button>

              {uploadedFiles.length === 0 && (
                <p className="text-sm text-gray-500">
                  Please upload your data files first
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Chat messages */}
              <ScrollArea className="h-96 w-full border rounded-lg p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-lg ${
                          message.role === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">
                          {message.streaming
                            ? streamingMessage
                            : message.content}
                          {message.streaming && (
                            <span className="animate-pulse">▋</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input area */}
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your data..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputValue.trim()}
                >
                  {isLoading ? "..." : "Send"}
                </Button>
              </div>

              {/* Reset chat button */}
              <div className="text-center">
                <Button
                  variant="outline"
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
                >
                  Reset Chat
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
