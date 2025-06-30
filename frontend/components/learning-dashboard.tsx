"use client"

import { useState, useRef, useEffect } from "react"
import { LearningPlan } from "@/components/learning-plan"
import { CoachPanel } from "@/components/coach-panel"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card } from "@/components/ui/card"

interface Task {
  description: string
  subtasks: string[]
}

interface Plan {
  title: string
  tasks: Task[]
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface LearningDashboardProps {
  topic: string
  plan: Plan | null
  isLoading: boolean
  error: string | null
  onBackToWelcome: () => void
}

export function LearningDashboard({ topic, plan, isLoading, error, onBackToWelcome }: LearningDashboardProps) {
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(plan)
  
  useEffect(() => {
    setCurrentPlan(plan);
  }, [plan]);

  const [completedSubtasks, setCompletedSubtasks] = useState<Set<string>>(new Set())
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: `coach-welcome-${Date.now()}`,
      role: "assistant",
      content: `Welcome to your learning journey on "${topic}"! I'm here to guide you through each step. Feel free to ask questions or share your insights as you progress.`,
    },
  ])

  const toggleSubtask = (taskIndex: number, subtaskIndex: number) => {
    const subtaskId = `${taskIndex}-${subtaskIndex}`
    const newCompleted = new Set(completedSubtasks)

    if (newCompleted.has(subtaskId)) {
      newCompleted.delete(subtaskId)
    } else {
      newCompleted.add(subtaskId)
    }

    setCompletedSubtasks(newCompleted)
  }

  const addChatMessage = (message: { role: "user" | "assistant"; content: string }) => {
    const newId = `${message.role}-${Date.now()}`;
    setChatMessages((prev) => [...prev, { ...message, id: newId }])
  }

  const handleStuck = async () => {
    if (!currentPlan) return;
    const currentTask = currentPlan.tasks[currentTaskIndex];
    if (!currentTask) return;
    
    addChatMessage({
      role: 'assistant',
      content: "收到，正在为你生成针对性强化练习...",
    });

    try {
        const response = await fetch("http://localhost:5001/api/initiate-remedial-loop", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                topic: topic,
                struggle_point: currentTask.description
            }),
        });

        if (!response.ok) throw new Error("生成强化练习失败");

        const data = await response.json();
        if(data.success && data.plan){
            addChatMessage({
                role: 'assistant',
                content: `已为你生成强化计划: **${data.plan.title}**\n- ${data.plan.tasks[0].subtasks.join("\n- ")}`,
            });
        }
    } catch (e) {
        addChatMessage({ role: 'assistant', content: e instanceof Error ? e.message : '抱歉，强化练习生成失败，请稍后重试。' });
    }
  }

  const triggerPlanAdjustment = async (insights: string[]) => {
    if (!currentPlan) {
      addChatMessage({ role: 'assistant', content: '无法在没有有效计划的情况下进行调整。'});
      return;
    }
    if (insights.length === 0) {
      addChatMessage({ role: 'assistant', content: '需要一些反馈或体会才能调整计划。'});
      return;
    }

    addChatMessage({ role: 'assistant', content: '收到您的反馈，正在为您智能调整学习计划...'});

    try {
      const response = await fetch("http://localhost:5001/api/adjust-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_task: currentPlan, insights }),
      });
      if (!response.ok) throw new Error("调整计划服务暂时不可用");
      
      const data = await response.json();
      if(data.success && data.plan){
        setCurrentPlan(data.plan);
        addChatMessage({ role: 'assistant', content: '计划已根据您的反馈更新！请查看新的学习地图。'});
      } else {
        throw new Error(data.detail || "未能获取调整后的计划。");
      }
    } catch(e) {
      addChatMessage({ role: 'assistant', content: e instanceof Error ? e.message : '抱歉，计划调整失败，请稍后重试。' });
    }
  }

  const handleAdjustPlanFromButton = async () => {
    const userInsights = chatMessages.filter(m => m.role === 'user').map(m => m.content);
    if (userInsights.length === 0) {
      addChatMessage({ role: 'assistant', content: '请先在聊天中分享一些您的学习体会，然后点击此按钮进行调整。'});
      return;
    }
    await triggerPlanAdjustment(userInsights);
  }

  const handleFeedbackAndAdjust = async (messageContent: string, isPositive: boolean) => {
    const feedbackInsight = isPositive 
        ? `我对这个内容感到满意，可以多来点类似的任务: "${messageContent}"`
        : `我对这个内容感到困难或不解，需要换个方式或者调整一下: "${messageContent}"`;
    await triggerPlanAdjustment([feedbackInsight]);
  }

  const handleAskCoach = async (question: string) => {
    addChatMessage({ role: "user", content: question });
    
    try {
      const response = await fetch("http://localhost:5001/api/ask-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context: { topic, subtasks: currentPlan?.tasks.flatMap(t => t.subtasks) || [] } }),
      });
      if(!response.ok) throw new Error("教练服务暂时不可用");

      const data = await response.json();
      if(data.success && data.answer) {
        let finalAnswer = data.answer;
        if (question.length > 5) { // Avoid adding prompt for simple greetings
          finalAnswer += '\n\n---\n*P.S. 您可以随时点击"调整计划"按钮，结合我们的对话来优化学习路径。*';
        }
        addChatMessage({ role: "assistant", content: finalAnswer });
      }
    } catch(e) {
      addChatMessage({ role: 'assistant', content: e instanceof Error ? e.message : '抱歉，回答失败，请稍后重试。' });
    }
  }

  const handleElaborateTask = async (taskContent: string) => {
    addChatMessage({ role: 'assistant', content: '正在为您深化任务，请稍候...'});
    try {
      const response = await fetch("http://localhost:5001/api/elaborate-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, task_description: taskContent }),
      });
      if (!response.ok) throw new Error("任务深化服务暂时不可用");

      const data = await response.json();
      if (data.success && data.elaboration) {
        addChatMessage({ role: "assistant", content: data.elaboration });
      } else {
        throw new Error("未能获取深化的任务内容。");
      }
    } catch (e) {
      addChatMessage({ role: 'assistant', content: e instanceof Error ? e.message : '抱歉，任务深化失败。' });
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center">
        <div className="text-[#7f8c8d]">正在为您生成专属学习计划，请稍候...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4">错误: {error}</div>
        <Button onClick={onBackToWelcome}>返回重试</Button>
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <div className="flex-1 w-full flex items-center justify-center">
        <div className="text-[#7f8c8d]">未能加载学习计划，请返回重试。</div>
      </div>
    )
  }

  const totalSubtasks = (currentPlan.tasks || []).reduce((sum, task) => sum + (task.subtasks?.length || 0), 0)
  const completedCount = completedSubtasks.size
  const progressPercentage = totalSubtasks > 0 ? (completedCount / totalSubtasks) * 100 : 0

  return (
    <div className="w-full flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8] px-6 py-4">
        <Button
          variant="ghost"
          onClick={onBackToWelcome}
          className="text-[#7f8c8d] hover:text-[#3d4451] hover:bg-[#f8f8f8] rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Welcome
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left Column - The Map */}
        <div className="lg:w-1/2 p-6 lg:p-8 overflow-y-auto">
          <LearningPlan
            plan={currentPlan}
            completedSubtasks={completedSubtasks}
            currentTaskIndex={currentTaskIndex}
            progressPercentage={progressPercentage}
            onToggleSubtask={toggleSubtask}
          />
        </div>

        {/* Right Column - The Compass */}
        <div className="lg:w-1/2 bg-[#f8f9fa] p-6 lg:p-8 border-l border-[#e8e8e8] flex flex-col">
          <CoachPanel
            chatMessages={chatMessages}
            onAddMessage={handleAskCoach}
            onStuck={handleStuck}
            onAdjustPlan={handleAdjustPlanFromButton}
            onFeedback={handleFeedbackAndAdjust}
            onElaborate={handleElaborateTask}
          />
        </div>
      </div>

      <div className="space-y-4">
        {(currentPlan.tasks || []).map((task, taskIndex) => {
          const isCurrentTask = taskIndex === currentTaskIndex
          const taskCompletedSubtasks = (task.subtasks || []).filter((_, subtaskIndex) =>
            completedSubtasks.has(`${taskIndex}-${subtaskIndex}`),
          ).length
          const isTaskCompleted = (task.subtasks?.length || 0) > 0 && taskCompletedSubtasks === (task.subtasks?.length || 0)

          return (
            <Card
              key={`task-${taskIndex}`}
              className={`flex items-center justify-between ${isCurrentTask ? 'bg-gray-100' : ''}`}
            >
              <h3 className={`${isCurrentTask ? 'font-bold' : ''}`}>{task.description}</h3>
              <span className="text-sm text-gray-500">{taskCompletedSubtasks} / {task.subtasks?.length || 0}</span>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
