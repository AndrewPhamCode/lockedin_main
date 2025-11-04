// src/App.tsx
"use client";

import { useState, useEffect } from "react";
import Login from "./components/Login";
import TaskManager from "./components/TaskManager";
import Profile from "./components/Profile";
import { api } from "./lib/api"; // uses the proxy (/api/...)

type Screen = "login" | "tasks" | "profile";

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");

  // Backend user id (ties tasks to the same user)
  const [userId, setUserId] = useState("");

  // User-facing fields
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [emergencyPassword, setEmergencyPassword] = useState("");

  // Timer state
  const [totalSeconds, setTotalSeconds] = useState(30 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [initialSeconds, setInitialSeconds] = useState(30 * 60);

  // Emergency unlock state
  const [emergencyUnlockUsed, setEmergencyUnlockUsed] = useState(false);
  const [preEmergencySeconds, setPreEmergencySeconds] = useState(0);
  const [preEmergencyInitialSeconds, setPreEmergencyInitialSeconds] = useState(0);

  // Load persisted state
  useEffect(() => {
    const savedState = localStorage.getItem("lockedInAppState");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setCurrentScreen(parsed.currentScreen || "login");
        setUserId(parsed.userId || "");
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

  // Persist state
  useEffect(() => {
    if (!isLoaded) return;
    const stateToSave = {
      currentScreen,
      userId,
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
  }, [
    isLoaded,
    currentScreen,
    userId,
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
  ]);

  // Find-or-create login so tasks persist for the same email
  const handleLogin = async (
  name: string,
  email: string,
  password: string,
  emergencyPwd?: string
  ) => {
  try {
    const user = await api.login({
      name,
      email,
      password,
      emergencyPassword: emergencyPwd || password,
    });

    setUserId(user._id);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserPassword(password);
    setEmergencyPassword(emergencyPwd || password);
    setCurrentScreen("tasks");
  } catch (err: any) {
    console.error("Login failed:", err.message);
    alert("Could not log in. Check server logs / network.");
  }
  };


  const handleLogout = () => {
    // stop timer before clearing everything
    setIsTimerRunning(false);
    setTotalSeconds(30 * 60);
    setInitialSeconds(30 * 60);
    
    setUserId("");
    setUserName("");
    setUserEmail("");
    setUserPassword("");
    setEmergencyPassword("");
    setCurrentScreen("login");
    setEmergencyUnlockUsed(false);
    setPreEmergencySeconds(0);
    setPreEmergencyInitialSeconds(0);
    localStorage.removeItem("lockedInAppState");
    localStorage.removeItem("lockedInTasks");
    localStorage.removeItem("lockedInCompletedTasks");
    localStorage.removeItem("lockedInTimerStartTime");
  };

  const handleOpenProfile = () => setCurrentScreen("profile");
  const handleBackToTasks = () => setCurrentScreen("tasks");

  if (!isLoaded) return null;

  return (
    <>
      {currentScreen === "login" && <Login onLogin={handleLogin} />}

      {currentScreen === "tasks" && (
        <TaskManager
          userId={userId} // backend key for fetching tasks
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
