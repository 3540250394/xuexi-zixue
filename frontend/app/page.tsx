"use client"

import { useState } from "react"
import { WelcomeScreen } from "@/components/welcome-screen"
import { LearningDashboard } from "@/components/learning-dashboard"

// 定义学习计划的数据结构
interface Task {
  description: string;
  subtasks: string[];
}

interface LearningPlan {
  title: string;
  tasks: Task[];
}

export default function Home() {
  const [currentView, setCurrentView] = useState<"welcome" | "dashboard">("welcome")
  const [learningTopic, setLearningTopic] = useState("")
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStartLearning = async (topic: string, mode: "quick" | "deep" = "quick") => {
    setLearningTopic(topic)
    setCurrentView("dashboard")
    setIsLoading(true)
    setError(null)
    setLearningPlan(null)

    try {
      const response = await fetch("http://localhost:5001/api/generate-task-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, mode }),
      })

      if (!response.ok || !response.body) {
        throw new Error(`请求失败，状态码: ${response.status}`)
      }
      
      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
      let accumulatedJson = ""

      readLoop: while (true) {
        const { value, done } = await reader.read()
        if (done) {
          break
        }
        
        const lines = value.split("\n\n")
        for (const line of lines) {
            if (line.startsWith("data:")) {
                const dataContent = line.substring(5).trim();
                if (dataContent === "[DONE]") {
                    break readLoop;
                }
                try {
                    const parsed = JSON.parse(dataContent);
                    accumulatedJson += parsed.content;
                } catch (e) {
                   console.error("Error parsing stream data chunk:", dataContent, e);
                }
            }
        }
      }

      try {
        if (accumulatedJson) {
          const finalPlan = JSON.parse(accumulatedJson);
          setLearningPlan(finalPlan);
        } else {
          throw new Error("No data received from stream.");
        }
      } catch (err) {
        console.error("Failed to parse final JSON:", accumulatedJson, err);
        setError("未能解析学习计划，收到的数据格式不正确。");
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "生成学习计划时发生未知错误")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartLearningFromDoc = async (content: string) => {
    setLearningTopic("从文档生成的学习计划")
    setCurrentView("dashboard")
    setIsLoading(true)
    setError(null)
    setLearningPlan(null)

    try {
      const response = await fetch("http://localhost:5001/api/generate-task-from-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error(`请求失败，状态码: ${response.status}`)
      }

      const data = await response.json()
      if (data.success && data.plan) {
        setLearningPlan(data.plan)
      } else {
        throw new Error(data.detail || "未能从文档生成有效的学习计划。")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成学习计划时发生未知错误")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToWelcome = () => {
    setCurrentView("welcome")
    setLearningTopic("")
    setLearningPlan(null)
    setIsLoading(false)
    setError(null)
  }

  return (
    <main className="min-h-screen bg-[#fbfbfa] flex flex-col">
      {currentView === "welcome" ? (
        <WelcomeScreen 
          onStartLearning={handleStartLearning} 
          onStartLearningFromDoc={handleStartLearningFromDoc}
        />
      ) : (
        <LearningDashboard 
          topic={learningTopic} 
          plan={learningPlan} 
          isLoading={isLoading}
          error={error}
          onBackToWelcome={handleBackToWelcome} 
        />
      )}
    </main>
  )
}
