"use client";

import { useState, useEffect } from "react";
import Login from "@/components/Login";
import TaskManager from "@/components/TaskManager";
import Profile from "@/components/Profile";

type Screen = "login" | "tasks" | "profile";

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [emergencyPassword, setEmergencyPassword] = useState("");
  
  // Timer state - lifted to App level to persist across screen changes
  const [totalSeconds, setTotalSeconds] = useState(30 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [initialSeconds, setInitialSeconds] = useState(30 * 60);
  
  // Emergency unlock state
  const [emergencyUnlockUsed, setEmergencyUnlockUsed] = useState(false);
  const [preEmergencySeconds, setPreEmergencySeconds] = useState(0);
  const [preEmergencyInitialSeconds, setPreEmergencyInitialSeconds] = useState(0);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("lockedInAppState");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setCurrentScreen(parsed.currentScreen || "login");
        setUserName(parsed.userName || "");
        setUserEmail(parsed.userEmail || "");
        setUserPassword(parsed.userPassword || "");
        setEmergencyPassword(parsed.emergencyPassword || "");
        setTotalSeconds(parsed.totalSeconds ?? 30 * 60);
        setIsTimerRunning(parsed.isTimerRunning || false);
        setInitialSeconds(parsed.initialSeconds ?? 30 * 60);
        setEmergencyUnlockUsed(parsed.emergencyUnlockUsed || false);
        setPreEmergencySeconds(parsed.preEmergencySeconds || 0);
        setPreEmergencyInitialSeconds(parsed.preEmergencyInitialSeconds || 0);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return;
    
    const stateToSave = {
      currentScreen,
      userName,
      userEmail,
      userPassword,
      emergencyPassword,
      totalSeconds,
      isTimerRunning,
      initialSeconds,
      emergencyUnlockUsed,
      preEmergencySeconds,
      preEmergencyInitialSeconds,
    };
    localStorage.setItem("lockedInAppState", JSON.stringify(stateToSave));
  }, [isLoaded, currentScreen, userName, userEmail, userPassword, emergencyPassword, totalSeconds, isTimerRunning, initialSeconds, emergencyUnlockUsed, preEmergencySeconds, preEmergencyInitialSeconds]);

  const handleLogin = (name: string, email: string, password: string, emergencyPwd?: string) => {
    setUserName(name);
    setUserEmail(email);
    setUserPassword(password);
    // For login, use the regular password as emergency password if not provided
    setEmergencyPassword(emergencyPwd || password);
    setCurrentScreen("tasks");
  };

  const handleLogout = () => {
    setUserName("");
    setUserEmail("");
    setUserPassword("");
    setEmergencyPassword("");
    setCurrentScreen("login");
    // Reset emergency unlock state
    setEmergencyUnlockUsed(false);
    setPreEmergencySeconds(0);
    setPreEmergencyInitialSeconds(0);
    // Clear localStorage on logout (but keep streak data)
    localStorage.removeItem("lockedInAppState");
    localStorage.removeItem("lockedInTasks");
    localStorage.removeItem("lockedInCompletedTasks");
    localStorage.removeItem("lockedInTimerStartTime");
    // Note: We keep lockedInStreak so users maintain their streak across logins
  };

  const handleOpenProfile = () => {
    setCurrentScreen("profile");
  };

  const handleBackToTasks = () => {
    setCurrentScreen("tasks");
  };

  // Don't render until state is loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <>
      {currentScreen === "login" && <Login onLogin={handleLogin} />}
      {currentScreen === "tasks" && (
        <TaskManager 
          userName={userName}
          onOpenProfile={handleOpenProfile}
          totalSeconds={totalSeconds}
          setTotalSeconds={setTotalSeconds}
          isTimerRunning={isTimerRunning}
          setIsTimerRunning={setIsTimerRunning}
          initialSeconds={initialSeconds}
          setInitialSeconds={setInitialSeconds}
          emergencyUnlockUsed={emergencyUnlockUsed}
          setEmergencyUnlockUsed={setEmergencyUnlockUsed}
          preEmergencySeconds={preEmergencySeconds}
          preEmergencyInitialSeconds={preEmergencyInitialSeconds}
        />
      )}
      {currentScreen === "profile" && (
        <Profile
          userName={userName}
          userEmail={userEmail}
          emergencyPassword={emergencyPassword}
          onBack={handleBackToTasks}
          onLogout={handleLogout}
          totalSeconds={totalSeconds}
          setTotalSeconds={setTotalSeconds}
          setIsTimerRunning={setIsTimerRunning}
          initialSeconds={initialSeconds}
          setEmergencyUnlockUsed={setEmergencyUnlockUsed}
          setPreEmergencySeconds={setPreEmergencySeconds}
          setPreEmergencyInitialSeconds={setPreEmergencyInitialSeconds}
        />
      )}
    </>
  );
}
