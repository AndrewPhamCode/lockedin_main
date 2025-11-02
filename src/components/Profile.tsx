"use client";

import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { ArrowLeft, LogOut, Trash2, User, Mail, Unlock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import Logo from "./Logo";

interface ProfileProps {
  userName: string;
  userEmail: string;
  emergencyPassword: string;
  onBack: () => void;
  onLogout: () => void;
  totalSeconds: number;
  setTotalSeconds: (value: number | ((prev: number) => number)) => void;
  setIsTimerRunning: (value: boolean) => void;
  initialSeconds: number;
  setEmergencyUnlockUsed: (value: boolean) => void;
  setPreEmergencySeconds: (value: number | ((prev: number) => number)) => void;
  setPreEmergencyInitialSeconds: (value: number | ((prev: number) => number)) => void;
}

export default function Profile({ 
  userName, 
  userEmail, 
  emergencyPassword, 
  onBack, 
  onLogout,
  totalSeconds,
  setTotalSeconds,
  setIsTimerRunning,
  initialSeconds,
  setEmergencyUnlockUsed,
  setPreEmergencySeconds,
  setPreEmergencyInitialSeconds
}: ProfileProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEmergencyUnlockOpen, setIsEmergencyUnlockOpen] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState("");
  const [emergencyError, setEmergencyError] = useState("");

  const handleDeleteProfile = () => {
    setIsDeleteDialogOpen(false);
    onLogout();
  };

  const handleLogout = () => {
    onLogout();
  };

  const handleEmergencyUnlock = () => {
    setEmergencyError("");
    
    if (!enteredPassword) {
      setEmergencyError("Please enter your emergency password");
      return;
    }

    if (enteredPassword !== emergencyPassword) {
      setEmergencyError("Incorrect emergency password");
      return;
    }

    // Save the current timer state before emergency unlock
    setPreEmergencySeconds(totalSeconds);
    setPreEmergencyInitialSeconds(initialSeconds);
    setEmergencyUnlockUsed(true);
    
    // Stop the timer and set it to 0
    setIsTimerRunning(false);
    setTotalSeconds(0);
    
    // Close the dialog and reset
    setIsEmergencyUnlockOpen(false);
    setEnteredPassword("");
    setEmergencyError("");
  };

  const handleEmergencyKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEmergencyUnlock();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 px-24 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Logo />
          <div className="w-24" /> {/* Spacer for centering */}
        </div>

        {/* Profile Information Card */}
        <Card className="p-8 bg-white shadow-sm">
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-200">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: '#6b1a1a' }}
              >
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl text-neutral-900">Profile Settings</h2>
                <p className="text-neutral-500">Manage your account information</p>
              </div>
            </div>

            {/* User Information */}
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-neutral-600 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <p className="text-neutral-900">{userName}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-neutral-600 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <p className="text-neutral-900">{userEmail}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions Card */}
        <Card className="p-8 bg-white shadow-sm">
          <div className="space-y-4">
            <h3 className="text-xl text-neutral-900 mb-4">Account Actions</h3>

            {/* Emergency Unlock Button */}
            {totalSeconds > 0 && (
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-14 text-base hover:bg-amber-50 hover:border-amber-300"
                onClick={() => setIsEmergencyUnlockOpen(true)}
                style={{ 
                  color: '#6b1a1a',
                  borderColor: '#6b1a1a20'
                }}
              >
                <Unlock className="w-5 h-5" />
                <div className="flex flex-col items-start">
                  <span>Emergency Unlock</span>
                  <span className="text-xs text-neutral-500">Stop the timer immediately</span>
                </div>
              </Button>
            )}

            {/* Logout Button */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-14 text-base hover:bg-neutral-50"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <div className="flex flex-col items-start">
                <span>Logout</span>
                <span className="text-xs text-neutral-500">Sign out of your account</span>
              </div>
            </Button>

            {/* Delete Profile Button */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-14 text-base hover:bg-red-50 hover:text-red-600 hover:border-red-300"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="w-5 h-5" />
              <div className="flex flex-col items-start">
                <span>Delete Profile</span>
                <span className="text-xs text-neutral-500">Permanently delete your account</span>
              </div>
            </Button>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all your data including tasks and history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProfile}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Emergency Unlock Dialog */}
      <Dialog open={isEmergencyUnlockOpen} onOpenChange={(open) => {
        setIsEmergencyUnlockOpen(open);
        if (!open) {
          setEnteredPassword("");
          setEmergencyError("");
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Unlock className="w-6 h-6" style={{ color: '#6b1a1a' }} />
              Emergency Unlock
            </DialogTitle>
            <DialogDescription>
              Enter your emergency unlock password to immediately stop the timer and unlock your tasks.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            {emergencyError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{emergencyError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="emergency-password">Emergency Password</Label>
              <Input
                id="emergency-password"
                type="password"
                placeholder="Enter your emergency password"
                value={enteredPassword}
                onChange={(e) => {
                  setEnteredPassword(e.target.value);
                  setEmergencyError("");
                }}
                onKeyPress={handleEmergencyKeyPress}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsEmergencyUnlockOpen(false);
                setEnteredPassword("");
                setEmergencyError("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEmergencyUnlock}
              style={{ backgroundColor: "#6b1a1a" }}
            >
              Unlock Timer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
