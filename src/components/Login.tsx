"use client";

import { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import Logo from "./Logo";

interface LoginProps {
  onLogin: (name: string, email: string, password: string, emergencyPassword?: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [emergencyPassword, setEmergencyPassword] = useState("");
  const [emergencyConfirm, setEmergencyConfirm] = useState("");
  const [signupError, setSignupError] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showEmergencyPassword, setShowEmergencyPassword] = useState(false);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  
  // Reset password error
  const [resetError, setResetError] = useState("");

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = () => {
    setLoginError("");
    
    if (!loginEmail || !loginPassword) {
      setLoginError("Please fill in all fields");
      return;
    }

    if (!validateEmail(loginEmail)) {
      setLoginError("Please enter a valid email address");
      return;
    }

    // Use email as name for login (since we don't have a name field in login)
    onLogin(loginEmail.split('@')[0], loginEmail, loginPassword);
  };

  const handleSignup = () => {
    setSignupError("");
    
    if (!signupName || !signupEmail || !signupPassword || !emergencyPassword || !emergencyConfirm) {
      setSignupError("Please fill in all fields");
      return;
    }

    if (!validateEmail(signupEmail)) {
      setSignupError("Please enter a valid email address");
      return;
    }

    if (emergencyPassword !== emergencyConfirm) {
      setSignupError("Emergency unlock passwords do not match");
      return;
    }

    onLogin(signupName, signupEmail, signupPassword, emergencyPassword);
  };

  const handlePasswordReset = () => {
    setResetError("");
    
    if (!resetEmail) {
      setResetError("Please enter your email address");
      return;
    }

    if (!validateEmail(resetEmail)) {
      setResetError("Please enter a valid email address");
      return;
    }

    setIsForgotPasswordOpen(false);
    setResetEmail("");
    setResetError("");
  };

  const handleLoginKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleSignupKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSignup();
    }
  };

  const handleResetKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePasswordReset();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <Logo />
        </div>

        {/* Login/Signup Card */}
        <Card className="p-8 bg-white shadow-sm">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <div className="space-y-5">
                {loginError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      setLoginError("");
                    }}
                    onKeyPress={handleLoginKeyPress}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        setLoginError("");
                      }}
                      onKeyPress={handleLoginKeyPress}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <Button
                  className="w-full mt-6"
                  style={{ backgroundColor: "#5e1b1b" }}
                  onClick={handleLogin}
                >
                  Log In
                </Button>
              </div>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <div className="space-y-5">
                {signupError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{signupError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your name"
                    value={signupName}
                    onChange={(e) => {
                      setSignupName(e.target.value);
                      setSignupError("");
                    }}
                    onKeyPress={handleSignupKeyPress}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signupEmail}
                    onChange={(e) => {
                      setSignupEmail(e.target.value);
                      setSignupError("");
                    }}
                    onKeyPress={handleSignupKeyPress}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={signupPassword}
                      onChange={(e) => {
                        setSignupPassword(e.target.value);
                        setSignupError("");
                      }}
                      onKeyPress={handleSignupKeyPress}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                    >
                      {showSignupPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="pt-4 border-t border-neutral-200">
                  <h4 className="text-sm text-neutral-700 mb-3">Emergency Unlock Password</h4>
                  <p className="text-xs text-neutral-500 mb-4">
                    Create a separate password to emergency unlock the timer when needed
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergency-password">Emergency Password</Label>
                      <div className="relative">
                        <Input
                          id="emergency-password"
                          type={showEmergencyPassword ? "text" : "password"}
                          placeholder="Create emergency password"
                          value={emergencyPassword}
                          onChange={(e) => {
                            setEmergencyPassword(e.target.value);
                            setSignupError("");
                          }}
                          onKeyPress={handleSignupKeyPress}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEmergencyPassword(!showEmergencyPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                        >
                          {showEmergencyPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency-confirm">Confirm Emergency Password</Label>
                      <div className="relative">
                        <Input
                          id="emergency-confirm"
                          type={showEmergencyConfirm ? "text" : "password"}
                          placeholder="Confirm emergency password"
                          value={emergencyConfirm}
                          onChange={(e) => {
                            setEmergencyConfirm(e.target.value);
                            setSignupError("");
                          }}
                          onKeyPress={handleSignupKeyPress}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEmergencyConfirm(!showEmergencyConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                        >
                          {showEmergencyConfirm ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full mt-6"
                  style={{ backgroundColor: "#5e1b1b" }}
                  onClick={handleSignup}
                >
                  Create Account
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your
              password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            {resetError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{resetError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => {
                  setResetEmail(e.target.value);
                  setResetError("");
                }}
                onKeyPress={handleResetKeyPress}
              />
            </div>
            <Button
              className="w-full"
              style={{ backgroundColor: "#6b1a1a" }}
              onClick={handlePasswordReset}
            >
              Send Reset Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
