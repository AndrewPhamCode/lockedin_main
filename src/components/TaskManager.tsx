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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import Logo from "./Logo";
import { DailyStreak } from "./DailyStreak";

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

interface CompletedTask {
  id: number;
  title: string;
  completedDate: string;
}

interface TaskManagerProps {
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
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Add tasks you need to complete", completed: false },
    { id: 2, title: "Set a timer to lock in and concentrate", completed: false },
    { id: 3, title: "Complete each task in the time assigned", completed: false },
    { id: 4, title: "After each task is complete, you can unlock your phone!", completed: false },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [previousTasks, setPreviousTasks] = useState<CompletedTask[]>([]);
  
  // Motivational messages that rotate
  const motivationalMessages = [
    "Lock in twin!",
    "We are ALL getting As",
    "What is procrastination?",
    "Failure? I hardly know her"
  ];
  const [messageIndex, setMessageIndex] = useState(0);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("lockedInTasks");
    const savedCompletedTasks = localStorage.getItem("lockedInCompletedTasks");
    
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        setTasks(parsed);
      } catch (e) {
        console.error("Failed to parse saved tasks", e);
      }
    }
    
    if (savedCompletedTasks) {
      try {
        const parsed = JSON.parse(savedCompletedTasks);
        setPreviousTasks(parsed);
      } catch (e) {
        console.error("Failed to parse saved completed tasks", e);
      }
    }
    
    setIsLoaded(true);
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("lockedInTasks", JSON.stringify(tasks));
  }, [tasks, isLoaded]);

  // Save completed tasks to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("lockedInCompletedTasks", JSON.stringify(previousTasks));
  }, [previousTasks, isLoaded]);

  // Rotate motivational messages every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % motivationalMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [motivationalMessages.length]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleToggleTask = (taskId: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const newCompleted = !task.completed;
          
          // If task is being completed, add to previous tasks
          if (newCompleted) {
            const currentDate = new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            setPreviousTasks((prev) => [
              {
                id: Date.now(),
                title: task.title,
                completedDate: currentDate,
              },
              ...prev,
            ]);
          } else {
            // If uncompleting, remove from previous tasks
            setPreviousTasks((prev) =>
              prev.filter((pt) => pt.title !== task.title)
            );
          }
          
          return { ...task, completed: newCompleted };
        }
        return task;
      })
    );
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      return;
    }

    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      completed: false,
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle("");
  };

  const handleDeleteTask = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task?.completed) {
      // Remove from previous tasks if it was completed
      setPreviousTasks((prev) => prev.filter((pt) => pt.title !== task.title));
    }
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  const handleRestartTimer = () => {
    setTotalSeconds(preEmergencySeconds);
    setInitialSeconds(preEmergencyInitialSeconds);
    setIsTimerRunning(true);
    setEmergencyUnlockUsed(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 px-24 py-6">
      <div className="max-w-full mx-auto space-y-6">
        {/* Header */}
        <div className="relative flex items-center justify-center">
          <Logo />
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 absolute right-0"
            onClick={onOpenProfile}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Welcome and Streak Section */}
        <Card className="p-6 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-neutral-900 text-3xl">
                Welcome, <span style={{ color: '#6b1a1a', fontWeight: '600' }}>{userName}</span>
              </h1>
              <p className="text-neutral-500 mt-1 transition-opacity duration-300">
                {motivationalMessages[messageIndex]}
              </p>
            </div>
            <DailyStreak maxDays={7} />
          </div>
        </Card>

        {/* Combined Timer and Progress Card */}
        <Card className="p-8 bg-white shadow-sm">
          <div className="grid grid-cols-2 gap-8">
            {/* Timer Section */}
            <div className="flex flex-col items-center border-r border-neutral-200 pr-8">
              <h2 className="text-neutral-900 text-2xl mb-6">Focus Timer</h2>
              <AnalogClock 
                totalSeconds={totalSeconds}
                setTotalSeconds={setTotalSeconds}
                isRunning={isTimerRunning}
                setIsRunning={setIsTimerRunning}
                initialSeconds={initialSeconds}
                setInitialSeconds={setInitialSeconds}
              />
            </div>

            {/* Progress Section */}
            <div className="flex flex-col items-center pl-8">
              <h2 className="text-neutral-900 text-2xl mb-6">Your Progress</h2>
              <CircularProgress
                value={progressPercentage}
                completedCount={completedCount}
                totalCount={totalCount}
                tasks={tasks}
              />
            </div>
          </div>
        </Card>

        {/* Restart Timer Button (shown after emergency unlock) */}
        {emergencyUnlockUsed && (
          <Card className="p-4 bg-amber-50 border-amber-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" style={{ color: '#6b1a1a' }} />
                </div>
                <div>
                  <p className="text-neutral-900" style={{ fontWeight: '600' }}>Timer was emergency unlocked</p>
                  <p className="text-sm text-neutral-600">Restart the timer to continue your focus session</p>
                </div>
              </div>
              <Button
                onClick={handleRestartTimer}
                style={{ backgroundColor: '#6b1a1a' }}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Restart Timer
              </Button>
            </div>
          </Card>
        )}

        {/* Tasks List */}
        <Card className="p-6 bg-white shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-neutral-900 text-2xl">Tasks</h2>
              <Badge variant="secondary" className="text-neutral-600">
                {totalCount} {totalCount === 1 ? 'task' : 'tasks'}
              </Badge>
            </div>

            <div className="space-y-4">
              {tasks.length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                  No tasks yet. Add one below to get started!
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-5 p-6 rounded-lg border transition-colors ${
                      task.completed
                        ? "bg-neutral-50 border-neutral-200"
                        : "bg-white border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full"
                      style={{ focusRingColor: "#6b1a1a" }}
                    >
                      {task.completed ? (
                        <CheckCircle2
                          className="w-7 h-7 cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ color: "#6b1a1a" }}
                        />
                      ) : (
                        <Circle className="w-7 h-7 text-neutral-300 cursor-pointer hover:text-neutral-400 transition-colors" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p
                        className={`text-base ${
                          task.completed
                            ? "text-neutral-500 line-through"
                            : "text-neutral-900"
                        }`}
                      >
                        {task.title}
                      </p>
                    </div>
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task.id)}
                      className="w-6 h-6"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTask(task.id)}
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

        {/* Add New Task Card */}
        <Card className="p-6 bg-white shadow-sm">
          <div className="flex gap-3">
            <Input
              placeholder={isTimerRunning ? "Timer is running..." : "Add a new task..."}
              className="flex-1 text-base"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTimerRunning}
            />
            <Button
              className="gap-2"
              onClick={handleAddTask}
              disabled={isTimerRunning}
            >
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </div>
        </Card>

        {/* Previous Tasks Section */}
        <Card className="p-6 bg-white shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-neutral-900 text-2xl">See previous tasks</h2>
              <Badge variant="secondary" className="text-neutral-600">
                <History className="w-3 h-3 mr-1" />
                {previousTasks.length} completed
              </Badge>
            </div>

            {previousTasks.length === 0 ? (
              <div className="text-center py-12 text-neutral-400">
                Your completed tasks will appear here
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {previousTasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-neutral-50 border border-neutral-200"
                    >
                      <CheckCircle2
                        className="w-6 h-6"
                        style={{ color: "#6b1a1a" }}
                      />
                      <div className="flex-1">
                        <p className="text-base text-neutral-500 line-through">
                          {task.title}
                        </p>
                      </div>
                      <span className="text-sm text-neutral-400">
                        {task.completedDate}
                      </span>
                    </div>
                  ))}
                </div>

                {previousTasks.length > 5 && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsAllTasksOpen(true)}
                    >
                      See all tasks
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

      </div>

      {/* All Tasks Dialog */}
      <Dialog open={isAllTasksOpen} onOpenChange={setIsAllTasksOpen}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-6">
          <DialogHeader className="flex-shrink-0 pb-4">
            <DialogTitle className="text-2xl">All Completed Tasks</DialogTitle>
            <DialogDescription>
              View all {previousTasks.length} previously completed tasks
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="space-y-3 pr-4">
                {previousTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-neutral-50 border border-neutral-200"
                  >
                    <CheckCircle2
                      className="w-6 h-6 flex-shrink-0"
                      style={{ color: "#6b1a1a" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-base text-neutral-500 line-through">
                        {task.title}
                      </p>
                    </div>
                    <span className="text-sm text-neutral-400 flex-shrink-0">
                      {task.completedDate}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
