"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

interface DailyStreakProps {
  maxDays?: number;
}

export function DailyStreak({ maxDays = 7 }: DailyStreakProps) {
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    // Get today's date (just the date part, no time)
    const today = new Date().toDateString();
    
    // Get streak data from localStorage
    const streakData = localStorage.getItem("lockedInStreak");
    
    if (streakData) {
      try {
        const parsed = JSON.parse(streakData);
        const lastVisit = parsed.lastVisit;
        const streak = parsed.streak || 0;
        
        // Check if this is a new day
        if (lastVisit !== today) {
          const lastVisitDate = new Date(lastVisit);
          const todayDate = new Date(today);
          const diffTime = todayDate.getTime() - lastVisitDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          let newStreak;
          if (diffDays === 1) {
            // Consecutive day - increment streak
            newStreak = Math.min(streak + 1, maxDays);
          } else if (diffDays > 1) {
            // Missed a day - reset to 1
            newStreak = 1;
          } else {
            // Same day (shouldn't happen, but just in case)
            newStreak = streak;
          }
          
          // Update localStorage
          localStorage.setItem("lockedInStreak", JSON.stringify({
            lastVisit: today,
            streak: newStreak
          }));
          
          setCurrentStreak(newStreak);
        } else {
          // Same day visit
          setCurrentStreak(streak);
        }
      } catch (e) {
        console.error("Failed to parse streak data", e);
        // Initialize streak
        localStorage.setItem("lockedInStreak", JSON.stringify({
          lastVisit: today,
          streak: 1
        }));
        setCurrentStreak(1);
      }
    } else {
      // First time user - initialize streak
      localStorage.setItem("lockedInStreak", JSON.stringify({
        lastVisit: today,
        streak: 1
      }));
      setCurrentStreak(1);
    }
  }, [maxDays]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-neutral-600">Daily Streak:</span>
        <span className="text-neutral-900" style={{ fontWeight: '600' }}>
          {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {Array.from({ length: maxDays }).map((_, index) => {
          const isFilled = index < currentStreak;
          return (
            <div
              key={index}
              className="relative transition-all duration-300"
              style={{
                transform: isFilled ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              <Star
                className={`w-7 h-7 transition-all duration-300 ${
                  isFilled ? 'fill-[#6b1a1a] stroke-[#6b1a1a]' : 'fill-none stroke-neutral-300'
                }`}
                strokeWidth={2}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
