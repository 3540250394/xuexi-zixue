"use client"

import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"

interface Task {
  description: string
  subtasks: string[]
}

interface Plan {
  title: string
  tasks: Task[]
}

interface LearningPlanProps {
  plan: Plan | null
  completedSubtasks: Set<string>
  currentTaskIndex: number
  progressPercentage: number
  onToggleSubtask: (taskIndex: number, subtaskIndex: number) => void
}

export function LearningPlan({
  plan,
  completedSubtasks,
  currentTaskIndex,
  progressPercentage,
  onToggleSubtask,
}: LearningPlanProps) {
  if (!plan) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light text-[#3d4451] mb-4 leading-relaxed">{plan.title}</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-[#7f8c8d]">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-[#e8e8e8]" />
        </div>
      </div>

      <div className="space-y-4">
        {plan.tasks.map((task, taskIndex) => {
          const isCurrentTask = taskIndex === currentTaskIndex
          const taskCompletedSubtasks = task.subtasks.filter((_, subtaskIndex) =>
            completedSubtasks.has(`${taskIndex}-${subtaskIndex}`),
          ).length
          const isTaskCompleted = taskCompletedSubtasks === task.subtasks.length

          return (
            <Card
              key={taskIndex}
              className={`p-6 rounded-2xl border-0 shadow-sm transition-all duration-200 ${
                isCurrentTask ? "bg-[#4a6988]/5 border-l-4 border-l-[#4a6988]" : "bg-white hover:shadow-md"
              }`}
            >
              <h3
                className={`text-lg font-medium mb-4 leading-relaxed ${
                  isTaskCompleted ? "text-[#7f8c8d] line-through" : "text-[#3d4451]"
                }`}
              >
                {task.description}
              </h3>

              <div className="space-y-3">
                {task.subtasks.map((subtask, subtaskIndex) => {
                  const subtaskId = `${taskIndex}-${subtaskIndex}`
                  const isCompleted = completedSubtasks.has(subtaskId)

                  return (
                    <div key={subtaskIndex} className="flex items-start space-x-3">
                      <Checkbox
                        id={subtaskId}
                        checked={isCompleted}
                        onCheckedChange={() => onToggleSubtask(taskIndex, subtaskIndex)}
                        className="mt-1 data-[state=checked]:bg-[#4a6988] data-[state=checked]:border-[#4a6988]"
                      />
                      <label
                        htmlFor={subtaskId}
                        className={`text-sm leading-relaxed cursor-pointer transition-colors ${
                          isCompleted ? "text-[#7f8c8d] line-through" : "text-[#3d4451] hover:text-[#4a6988]"
                        }`}
                      >
                        {subtask}
                      </label>
                    </div>
                  )
                })}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
