// src/components/TaskManager.tsx
"use client";

import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { CheckCircle2, Circle, Plus, History, Trash2, Settings, RotateCcw } from "lucide-react";
import { AnalogClock } from "./AnalogClock";
import { CircularProgress } from "./CircularProgress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import Logo from "./Logo";
import { DailyStreak } from "./DailyStreak";
import { api } from "@/lib/api";

const ESP_IP = "http://172.20.10.8";

type BackendTask = {
  _id: string;
  userId: string;
  title: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
};

interface CompletedTask {
  id: string;
  title: string;
  completedDate: string;
}

interface TaskManagerProps {
  userId: string;
  userName: string;
  onOpenProfile: () => void;
  totalSeconds: number;
  setTotalSeconds: (value: number | ((prev: number) => number)) => void;
  isTimerRunning: boolean;
  setIsTimerRunning: (value: boolean) => void;
  initialSeconds: number;
  setInitialSeconds: (value: number | ((prev: number) => number)) => void;
  emergencyUnlockUsed: boolean;
  setEmergencyUnlockUsed: (value: boolean) => void;
  preEmergencySeconds: number;
  preEmergencyInitialSeconds: number;
}

export default function TaskManager({
  userId,
  userName,
  onOpenProfile,
  totalSeconds,
  setTotalSeconds,
  isTimerRunning,
  setIsTimerRunning,
  initialSeconds,
  setInitialSeconds,
  emergencyUnlockUsed,
  setEmergencyUnlockUsed,
  preEmergencySeconds,
  preEmergencyInitialSeconds
}: TaskManagerProps) {

  const [isLoaded, setIsLoaded] = useState(false);
  const [isAllTasksOpen, setIsAllTasksOpen] = useState(false);
  const [tasks, setTasks] = useState<BackendTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [previousTasks, setPreviousTasks] = useState<CompletedTask[]>([]);
  const [err, setErr] = useState<string>("");

  const motivationalMessages = [
    "Lock in twin!",
    "We are ALL getting As",
    "What is procrastination?",
    "Failure? I hardly know her"
  ];
  const [messageIndex, setMessageIndex] = useState(0);

  // Load completed tasks
  useEffect(() => {
    const savedCompletedTasks = localStorage.getItem("lockedInCompletedTasks");
    if (savedCompletedTasks) {
      try {
        setPreviousTasks(JSON.parse(savedCompletedTasks));
      } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  // Load backend tasks
  useEffect(() => {
    if (!userId) return;
    api.listTasks(userId)
      .then((list) => setTasks(list))
      .catch((e) => setErr(e.message));
  }, [userId]);

  // Save completed tasks locally
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("lockedInCompletedTasks", JSON.stringify(previousTasks));
  }, [previousTasks, isLoaded]);

  // Rotate motivational messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % motivationalMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [motivationalMessages.length]);

  // 🚨 AUTO-STOP WHEN ALL TASKS COMPLETE
  useEffect(() => {
    if (tasks.length === 0) return;
    const allDone = tasks.every((t) => t.completed);

    if (allDone && isTimerRunning) {
      console.log("🎉 All tasks complete — requesting ESP32 STOP");
      window.dispatchEvent(new CustomEvent("LOCKEDIN_AUTOSTOP"));
      setIsTimerRunning(false);
      setTotalSeconds(0);
    }
  }, [tasks, isTimerRunning]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  async function handleToggleTask(taskId: string) {
    try {
      const found = tasks.find((t) => t._id === taskId);
      if (!found) return;
      const updated = await api.updateTask(taskId, { completed: !found.completed });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));

      if (!found.completed) {
        const currentDate = new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        setPreviousTasks((prev) => [
          { id: String(Date.now()), title: found.title, completedDate: currentDate },
          ...prev,
        ]);
      } else {
        setPreviousTasks((prev) => prev.filter((pt) => pt.title !== found.title));
      }
    } catch (e: any) {
      setErr(e.message);
    }
  }

  async function handleAddTask() {
    const title = newTaskTitle.trim();
    if (!title || !userId) return;
    try {
      const created = await api.createTask({ userId, title });
      setTasks((prev) => [created, ...prev]);
      setNewTaskTitle("");
    } catch (e: any) {
      setErr(e.message);
    }
  }

  async function handleDeleteTask(taskId: string) {
    try {
      const task = tasks.find((t) => t._id === taskId);
      if (task?.completed) {
        setPreviousTasks((prev) => prev.filter((pt) => pt.title !== task.title));
      }
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (e: any) {}
  }

  function handleRestartTimer() {
    setTotalSeconds(preEmergencySeconds);
    setInitialSeconds(preEmergencyInitialSeconds);
    setIsTimerRunning(true);
    setEmergencyUnlockUsed(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 px-24 py-6">
      <div className="max-w-full mx-auto space-y-6">

        {/* HEADER */}
        <div className="relative flex items-center justify-center">
          <Logo />
          <Button variant="ghost" size="icon" className="w-10 h-10 absolute right-0" onClick={onOpenProfile}>
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* TIMER & CLOCK */}
        <Card className="p-8 bg-white shadow-sm">
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col items-center border-r border-neutral-200 pr-8">
              <h2 className="text-neutral-900 text-2xl mb-6">Focus Timer</h2>

              {/* HERE: AnalogClock receives the auto-stop trigger */}
              <AnalogClock
  totalSeconds={totalSeconds}
  setTotalSeconds={setTotalSeconds}
  isRunning={isTimerRunning}
  setIsRunning={setIsTimerRunning}
  initialSeconds={initialSeconds}
  setInitialSeconds={setInitialSeconds}
  allTasksComplete={completedCount > 0 && completedCount === totalCount}
/>

              />
            </div>

            {/* PROGRESS RING */}
            <div className="flex flex-col items-center pl-8">
              <h2 className="text-neutral-900 text-2xl mb-6">Your Progress</h2>
              <CircularProgress
                value={progressPercentage}
                completedCount={completedCount}
                totalCount={totalCount}
                tasks={tasks.map(t => ({ id: t._id, title: t.title, completed: t.completed }))}
              />
            </div>
          </div>
        </Card>

        {/* TASKS */}
        <Card className="p-6 bg-white shadow-sm">
          <div className="space-y-4">

            <div className="flex items-center justify-between">
              <h2 className="text-neutral-900 text-2xl">Tasks</h2>
              <Badge variant="secondary" className="text-neutral-600">
                {totalCount} {totalCount === 1 ? "task" : "tasks"}
              </Badge>
            </div>

            <div className="space-y-4">
              {tasks.length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                  No tasks yet. Add one below!
                </div>
              ) : (
                tasks.map(task => (
                  <div
                    key={task._id}
                    className={`flex items-center gap-5 p-6 rounded-lg border transition-colors ${
                      task.completed ? "bg-neutral-50 border-neutral-200"
                                      : "bg-white border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <button onClick={() => handleToggleTask(task._id)}>
                      {task.completed ? (
                        <CheckCircle2 className="w-7 h-7" style={{ color: "#6b1a1a" }} />
                      ) : (
                        <Circle className="w-7 h-7 text-neutral-300" />
                      )}
                    </button>

                    <p className={`flex-1 text-base ${task.completed ? "line-through text-neutral-500" : "text-neutral-900"}`}>
                      {task.title}
                    </p>

                    <Checkbox checked={task.completed} onCheckedChange={() => handleToggleTask(task._id)} />

                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task._id)}
                      className="text-neutral-400 hover:text-red-600"
                      disabled={isTimerRunning}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* ADD TASK */}
        <Card className="p-6 bg-white shadow-sm">
          <div className="flex gap-3">
            <Input
              placeholder={isTimerRunning ? "Timer is running..." : "Add a new task..."}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              disabled={isTimerRunning}
            />
            <Button onClick={handleAddTask} disabled={isTimerRunning}>
              <Plus className="w-4 h-4" /> Add Task
            </Button>
          </div>
        </Card>

      </div>
    </div>
  );
}
