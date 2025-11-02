"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Minus,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { Button } from "./ui/button";

interface AnalogClockProps {
  totalSeconds: number;
  setTotalSeconds: (
    value: number | ((prev: number) => number),
  ) => void;
  isRunning: boolean;
  setIsRunning: (value: boolean) => void;
  initialSeconds: number;
  setInitialSeconds: (
    value: number | ((prev: number) => number),
  ) => void;
}

export function AnalogClock({
  totalSeconds,
  setTotalSeconds,
  isRunning,
  setIsRunning,
  initialSeconds,
  setInitialSeconds,
}: AnalogClockProps) {
  // Track timer start timestamp
  useEffect(() => {
    if (isRunning) {
      const now = Date.now();
      const existingTimestamp = localStorage.getItem(
        "lockedInTimerStartTime",
      );

      if (!existingTimestamp) {
        // First time starting the timer, save the current timestamp
        localStorage.setItem(
          "lockedInTimerStartTime",
          now.toString(),
        );
      }
    } else {
      // Timer stopped, remove timestamp
      localStorage.removeItem("lockedInTimerStartTime");
    }
  }, [isRunning]);

  // On mount, check if timer should have been running and adjust totalSeconds
  useEffect(() => {
    const startTime = localStorage.getItem(
      "lockedInTimerStartTime",
    );
    if (startTime && isRunning) {
      const elapsed = Math.floor(
        (Date.now() - parseInt(startTime)) / 1000,
      );
      const newTotalSeconds = Math.max(
        0,
        totalSeconds - elapsed,
      );

      if (newTotalSeconds !== totalSeconds) {
        setTotalSeconds(newTotalSeconds);
        if (newTotalSeconds === 0) {
          setIsRunning(false);
          localStorage.removeItem("lockedInTimerStartTime");
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

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

  const toggleTimer = () => {
    if (totalSeconds === 0) {
      return;
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTotalSeconds(initialSeconds);
    localStorage.removeItem("lockedInTimerStartTime");
  };

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Calculate progress percentage (elapsed time)
  const progressPercentage =
    initialSeconds > 0
      ? ((initialSeconds - totalSeconds) / initialSeconds) * 100
      : 0;

  // Calculate single hand angle - starts at 12:00 and rotates clockwise as time progresses
  // -90 degrees is the 12 o'clock position, then add rotation based on progress
  const handAngle = -90 + (progressPercentage / 100) * 360;

  // Calculate stroke dasharray for progress ring
  const radius = 120; // Adjusted radius for the progress ring
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Analog Clock */}
      <div className="relative w-64 h-64">
        {/* Outer Progress Ring SVG */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Background ring */}
          <circle
            cx="128"
            cy="128"
            r={radius}
            fill="none"
            stroke="#e5e5e5"
            strokeWidth="8"
          />
          {/* Progress ring */}
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

        {/* Clock face */}
        <div
          className="absolute inset-0 rounded-full border-8 border-neutral-300 bg-white shadow-lg"
          style={{ margin: "8px" }}
        >
          {/* Hour markers */}
          {[...Array(12)].map((_, i) => {
            const angle = i * 30 - 90;
            const x =
              50 + 40 * Math.cos((angle * Math.PI) / 180);
            const y =
              50 + 40 * Math.sin((angle * Math.PI) / 180);
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

          {/* Center dot */}
          <div
            className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ backgroundColor: "#6b1a1a" }}
          />

          {/* Single timer hand - starts at 12:00 and rotates clockwise */}
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

      {/* Time display */}
      <div className="text-center">
        <div className="text-5xl text-neutral-900 tabular-nums">
          {hours.toString().padStart(2, "0")}:
          {minutes.toString().padStart(2, "0")}:
          {seconds.toString().padStart(2, "0")}
        </div>
        <p className="text-neutral-500 mt-2">
          {totalSeconds === 0
            ? "The timer has ended, you can now unlock your phone!"
            : isRunning
              ? "Running..."
              : "Time Remaining"}
        </p>
      </div>

      {/* Controls */}
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
          onClick={toggleTimer}
          style={{
            backgroundColor: isRunning ? "#d97706" : "#6b1a1a",
          }}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start
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

      {/* Reset button */}
      {(isRunning || totalSeconds !== initialSeconds) && (
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={resetTimer}
        >
          <RotateCcw className="w-4 h-4" />
          Reset Timer
        </Button>
      )}
    </div>
  );
}