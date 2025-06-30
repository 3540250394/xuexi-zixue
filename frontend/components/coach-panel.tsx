"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send, HelpCircle, Settings, ThumbsUp, ThumbsDown, MoreHorizontal, Copy, Search, ChevronsRight } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessage {
  id: string;
  role: "user" | "assistant"
  content: string
}

interface CoachPanelProps {
  chatMessages: ChatMessage[]
  onAddMessage: (question: string) => void
  onStuck: () => void
  onAdjustPlan: () => void
  onFeedback: (messageContent: string, isPositive: boolean) => void;
  onElaborate: (taskContent: string) => void;
}

export function CoachPanel({ chatMessages, onAddMessage, onStuck, onAdjustPlan, onFeedback, onElaborate }: CoachPanelProps) {
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onAddMessage(inputValue.trim())
      setInputValue("")
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Optional: show a toast or confirmation
      console.log("Copied to clipboard");
    });
  };

  const handleSearch = (text: string) => {
    window.open(`https://metaso.cn/?q=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-xl font-light text-[#3d4451] mb-6 leading-relaxed">智能教练</h3>

      {/* Chat Interface */}
      <Card className="flex-1 flex flex-col rounded-2xl border-0 shadow-sm bg-white overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((message, index) => (
            <div key={index} className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}>
              <div className="flex items-center gap-2">
                {message.role === 'assistant' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => handleCopy(message.content)}>
                        <Copy className="mr-2 h-4 w-4" />
                        <span>复制</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSearch(message.content)}>
                        <Search className="mr-2 h-4 w-4" />
                        <span>搜索</span>
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => onElaborate(message.content)}>
                        <ChevronsRight className="mr-2 h-4 w-4" />
                        <span>深化讲解</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          onFeedback(message.content, true)
                          setFeedbackGiven(prev => ({...prev, [message.id]: true}))
                        }}
                        disabled={feedbackGiven[message.id]}
                      >
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        <span>有帮助</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          onFeedback(message.content, false)
                          setFeedbackGiven(prev => ({...prev, [message.id]: true}))
                        }}
                        disabled={feedbackGiven[message.id]}
                      >
                         <ThumbsDown className="mr-2 h-4 w-4" />
                        <span>没帮助</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <div
                  className={`prose prose-sm max-w-full p-3 rounded-2xl text-sm leading-relaxed ${
                    message.role === "user" ? "bg-[#4a6988] text-white prose-invert" : "bg-white text-[#3d4451]"
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-[#e8e8e8] p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question or share an insight..."
              className="flex-1 rounded-xl border-[#e8e8e8] focus-visible:ring-[#4a6988]/30"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim()}
              className="rounded-xl bg-[#4a6988] hover:bg-[#4a6988]/90 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        <Button
          variant="outline"
          onClick={onStuck}
          className="w-full rounded-xl border-[#e8e8e8] text-[#3d4451] hover:bg-[#f8f9fa] hover:text-[#4a6988] hover:border-[#4a6988]/30 bg-transparent"
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          I'm stuck on this step
        </Button>

        <Button
          variant="outline"
          onClick={onAdjustPlan}
          className="w-full rounded-xl border-[#e8e8e8] text-[#3d4451] hover:bg-[#f8f9fa] hover:text-[#4a6988] hover:border-[#4a6988]/30 bg-transparent"
        >
          <Settings className="w-4 h-4 mr-2" />
          Adjust the plan based on my insights
        </Button>
      </div>
    </div>
  )
}
