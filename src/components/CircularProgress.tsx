"use client";

interface CircularProgressProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  completedCount: number;
  totalCount: number;
  tasks: { id: number; title: string; completed: boolean; }[];
}

export function CircularProgress({
  value,
  size = 256,
  strokeWidth = 20,
  completedCount,
  totalCount,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const allTasksCompleted = value === 100;
  const progressColor = allTasksCompleted ? "#86d177" : "#6b1a1a";

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e5e5"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={progressColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-6xl text-neutral-900">
            <span style={{ color: '#6b1a1a' }}>{completedCount}</span>
            <span className="text-neutral-400 text-3xl"> of </span>
            <span>{totalCount}</span>
          </div>
          <p className="text-neutral-500 mt-2">Tasks Completed</p>
        </div>
      </div>
      {value === 100 && (
        <p className="text-neutral-600 text-center">
          All tasks are completed, you can now unlock your phone!
        </p>
      )}
    </div>
  );
}
