"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";

const ESP_IP = "http://172.20.10.8";

interface AnalogClockProps {
  totalSeconds: number;
  setTotalSeconds: (value: number | ((prev: number) => number)) => void;
  isRunning: boolean;
  setIsRunning: (value: boolean) => void;
  initialSeconds: number;
  setInitialSeconds: (value: number | ((prev: number) => number)) => void;

  // ✅ NEW PROP
  allTasksComplete: boolean;
}

export function AnalogClock({
  totalSeconds,
  setTotalSeconds,
  isRunning,
  setIsRunning,
  initialSeconds,
  setInitialSeconds,
  allTasksComplete, // <- NEW
}: AnalogClockProps) {
  const [isPaused, setIsPaused] = useState(false);

  // 🧠 Poll ESP32 periodically
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${ESP_IP}/status`);
        const data = await res.json();

        setIsRunning(data.active);
        setIsPaused(data.paused);
        if (data.remaining !== undefined) {
          setTotalSeconds(data.remaining);
        }
      } catch (err) {
        console.warn("ESP32 not reachable:", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [setIsRunning, setTotalSeconds]);

  // ▶️ Start
  const startTimer = async () => {
    if (totalSeconds === 0) return;
    try {
      await fetch(`${ESP_IP}/start?duration=${totalSeconds}`);
      setIsRunning(true);
      setIsPaused(false);
    } catch (err) {
      console.error("Failed to start timer:", err);
    }
  };

  // ⏸ Pause / Resume
  const togglePause = async () => {
    try {
      const res = await fetch(`${ESP_IP}/pause`);
      const data = await res.json();

      if (data.status === "paused") {
        setIsRunning(false);
        setIsPaused(true);
      } else if (data.status === "resumed") {
        setIsRunning(true);
        setIsPaused(false);
      }
    } catch (err) {
      console.error("Failed to pause/resume:", err);
    }
  };

  // ⏹ Stop
  const stopTimer = async () => {
    try {
      await fetch(`${ESP_IP}/stop`);
    } catch (err) {
      console.error("Failed to stop timer:", err);
    }
    setIsRunning(false);
    setIsPaused(false);
    setTotalSeconds(initialSeconds);
  };

  // 🟢 NEW: AUTO-STOP WHEN TASKS HIT 0
  useEffect(() => {
    if (!allTasksComplete) return;

    console.log("✅ All tasks complete — stopping ESP32 timer...");

    fetch(`${ESP_IP}/stop`)
      .then(() => console.log("ESP32 timer stopped"))
      .catch((err) => console.error("Failed to stop ESP32:", err));

    // Reset UI
    setIsRunning(false);
    setIsPaused(false);
    setTotalSeconds(0);
  }, [allTasksComplete]);

  // Visual countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            localStorage.removeItem("lockedInTimerStartTime");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, totalSeconds, setTotalSeconds, setIsRunning]);

  // Time controls
  const addTime = () => {
    setTotalSeconds((prev) => prev + 5 * 60);
    setInitialSeconds((prev) => prev + 5 * 60);
  };

  const subtractTime = () => {
    if (totalSeconds > 30 * 60) {
      setTotalSeconds((prev) => prev - 5 * 60);
      setInitialSeconds((prev) => prev - 5 * 60);
    }
  };

  const handleToggle = () => {
    if (!isRunning && !isPaused) startTimer();
    else if (isRunning) togglePause();
    else if (isPaused) togglePause();
  };

  const resetTimer = () => {
    stopTimer();
    localStorage.removeItem("lockedInTimerStartTime");
  };

  // Display + clock math
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const progressPercentage =
    initialSeconds > 0
      ? ((initialSeconds - totalSeconds) / initialSeconds) * 100
      : 0;

  const handAngle = -90 + (progressPercentage / 100) * 360;

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Clock */}
      <div className="relative w-64 h-64">
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx="128"
            cy="128"
            r={radius}
            fill="none"
            stroke="#e5e5e5"
            strokeWidth="8"
          />
          <circle
            cx="128"
            cy="128"
            r={radius}
            fill="none"
            stroke={totalSeconds === 0 ? "#86d177" : "#6b1a1a"}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: isRunning
                ? "stroke-dashoffset 1s linear"
                : "stroke-dashoffset 0.3s ease",
            }}
          />
        </svg>

        <div
          className="absolute inset-0 rounded-full border-8 border-neutral-300 bg-white shadow-lg"
          style={{ margin: "8px" }}
        >
          {[...Array(12)].map((_, i) => {
            const angle = i * 30 - 90;
            const x = 50 + 40 * Math.cos((angle * Math.PI) / 180);
            const y = 50 + 40 * Math.sin((angle * Math.PI) / 180);
            return (
              <div
                key={i}
                className="absolute w-2 h-2 bg-neutral-400 rounded-full"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            );
          })}

          <div
            className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ backgroundColor: "#6b1a1a" }}
          />

          <div
            className="absolute top-1/2 left-1/2 origin-left rounded-full transition-transform duration-1000"
            style={{
              width: "40%",
              height: "6px",
              backgroundColor: "#6b1a1a",
              transform: `translate(0, -50%) rotate(${handAngle}deg)`,
            }}
          />
        </div>
      </div>

      {/* Display */}
      <div className="text-center">
        <div className="text-5xl text-neutral-900 tabular-nums">
          {`${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`}
        </div>
        <p className="text-neutral-500 mt-2">
          {totalSeconds === 0
            ? "Timer ended — you can now unlock!"
            : isRunning
            ? "Running..."
            : isPaused
            ? "Paused"
            : "Ready"}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="lg"
          className="gap-2 w-28"
          onClick={subtractTime}
          disabled={isRunning || totalSeconds <= 30 * 60}
        >
          <Minus className="w-5 h-5" />5 min
        </Button>

        <Button
          size="lg"
          className="gap-2 w-40"
          onClick={handleToggle}
          style={{
            backgroundColor: isRunning && !isPaused ? "#d97706" : "#6b1a1a",
          }}
        >
          {isRunning && !isPaused ? (
            <>
              <Pause className="w-5 h-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              {isPaused ? "Resume" : "Start"}
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="gap-2 w-28"
          onClick={addTime}
          disabled={isRunning}
        >
          <Plus className="w-5 h-5" />5 min
        </Button>
      </div>

      {/* ⭐ Only allow Reset when timer hits 0 */}
      {totalSeconds === 0 && (
  <Button
    variant="outline"
    size="lg"
    className="gap-2 border-green-600 text-green-700"
    onClick={resetTimer}
  >
    🔓 Unlocked
  </Button>
)}


    </div>
  );
}
