"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface WelcomeScreenProps {
  onStartLearning: (topic: string, mode: "quick" | "deep") => void
  onStartLearningFromDoc: (content: string) => void
}

export function WelcomeScreen({ onStartLearning, onStartLearningFromDoc }: WelcomeScreenProps) {
  const [topic, setTopic] = useState("")
  const [mode, setMode] = useState<"quick" | "deep">("quick")
  const [docContent, setDocContent] = useState("")

  const handleTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (topic.trim()) {
      onStartLearning(topic.trim(), mode)
    }
  }

  const handleDocSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (docContent.trim().length > 100) {
      onStartLearningFromDoc(docContent.trim())
    }
  }

  return (
    <div className="flex-1 w-full flex items-center justify-center px-6">
      <div className="w-full max-w-2xl text-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-light text-[#3d4451] leading-relaxed">
          {"how to learning today......."} 
        </h1>

        <Tabs defaultValue="topic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="topic">按主题学习</TabsTrigger>
            <TabsTrigger value="from-document">从文档学习</TabsTrigger>
          </TabsList>
          <TabsContent value="topic">
            <form onSubmit={handleTopicSubmit} className="space-y-6 pt-6">
          <Input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., 'The Principles of Quantum Mechanics' or 'How to Bake Sourdough Bread'"
            className="w-full h-14 text-lg px-6 rounded-2xl border-0 shadow-sm bg-white text-[#3d4451] placeholder:text-[#7f8c8d] focus-visible:ring-2 focus-visible:ring-[#4a6988]/30 focus-visible:ring-offset-0"
          />
              
              <ToggleGroup 
                type="single" 
                value={mode}
                onValueChange={(value) => {
                  if (value) setMode(value as "quick" | "deep");
                }}
                className="justify-center"
              >
                <ToggleGroupItem value="quick">快速模式</ToggleGroupItem>
                <ToggleGroupItem value="deep">深度模式</ToggleGroupItem>
              </ToggleGroup>

          <Button
            type="submit"
            disabled={!topic.trim()}
            className="h-14 px-12 text-lg font-medium rounded-2xl bg-[#4a6988] hover:bg-[#4a6988]/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-[#4a6988]/30 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
                开始学习
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="from-document">
            <form onSubmit={handleDocSubmit} className="space-y-6 pt-6">
               <Textarea
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="在此处粘贴您的文档内容 (至少100个字符)..."
                  className="w-full h-48 text-base p-4 rounded-2xl border-0 shadow-sm bg-white text-[#3d4451] placeholder:text-[#7f8c8d] focus-visible:ring-2 focus-visible:ring-[#4a6988]/30 focus-visible:ring-offset-0"
                />
              <Button
                type="submit"
                disabled={docContent.trim().length < 100}
                className="h-14 px-12 text-lg font-medium rounded-2xl bg-[#4a6988] hover:bg-[#4a6988]/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-[#4a6988]/30 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                从文档生成计划
          </Button>
        </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
