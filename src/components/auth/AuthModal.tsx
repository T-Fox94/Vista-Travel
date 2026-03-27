"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { LogIn, Eye, EyeOff, Mail, Phone, Loader2, UserPlus } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register, forgotPassword } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.identifier || !loginForm.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    const result = await login(loginForm.identifier, loginForm.password);
    setIsLoading(false);
    if (result.success) {
      toast.success("Welcome back!");
      onClose();
      setLoginForm({ identifier: "", password: "" });
    } else {
      toast.error(result.error || "Login failed");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    const result = await register({
      firstName: registerForm.firstName,
      lastName: registerForm.lastName,
      email: registerForm.email,
      username: registerForm.username || undefined,
      phone: registerForm.phone,
      password: registerForm.password,
    });
    setIsLoading(false);
    if (result.success) {
      toast.success("Account created successfully!");
      onClose();
    } else {
      toast.error(result.error || "Registration failed");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Please enter your email");
      return;
    }
    setIsLoading(true);
    const result = await forgotPassword(forgotEmail);
    setIsLoading(false);
    if (result.success) {
      toast.success("Password reset link sent to your email!");
      setShowForgotPassword(false);
    }
  };

  const handleClose = () => {
    setShowForgotPassword(false);
    setForgotEmail("");
    setActiveTab("login");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {showForgotPassword ? "Reset Password" : activeTab === "login" ? "Sign In" : "Create Account"}
          </DialogTitle>
        </DialogHeader>

        {!showForgotPassword && (
          <div className="flex bg-stone-100/80 dark:bg-stone-800/50 p-1 rounded-full mb-8">
            <button
              onClick={() => setActiveTab("login")}
              className={cn(
                "flex-1 py-2 rounded-full text-sm font-bold transition-all duration-200",
                activeTab === "login"
                  ? "bg-white dark:bg-stone-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "bg-transparent text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
              )}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={cn(
                "flex-1 py-2 rounded-full text-sm font-bold transition-all duration-200",
                activeTab === "register"
                  ? "bg-white dark:bg-stone-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "bg-transparent text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
              )}
            >
              Register
            </button>
          </div>
        )}

        {showForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <p className="text-sm text-gray-500 text-center leading-relaxed">Enter your email to receive a password reset link.</p>
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-stone-500 tracking-wider">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Input type="email" placeholder="your@email.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required className="pl-11" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForgotPassword(false)} className="flex-1 rounded-xl h-11">Back</Button>
              <Button type="submit" disabled={isLoading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 shadow-lg shadow-emerald-500/20">{isLoading ? "Sending..." : "Send Link"}</Button>
            </div>
          </form>
        ) : activeTab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-stone-500 tracking-wider">Email or Username</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Input type="text" placeholder="you or you@example.com" value={loginForm.identifier} onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })} required className="pl-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-stone-500 tracking-wider">Password</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Enter password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required className="pr-11" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                   {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <button type="button" onClick={() => setShowForgotPassword(true)} className="text-emerald-600 hover:text-emerald-700 transition-colors">Forgot password?</button>
              <button type="button" onClick={() => setActiveTab("register")} className="text-stone-400 hover:text-stone-600 transition-colors">Create account</button>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 font-bold shadow-lg shadow-emerald-500/20">
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Signing in...</> : <><LogIn className="w-4 h-4 mr-2" />Sign In</>}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-stone-500 tracking-wider">First Name</Label>
                <Input placeholder="John" value={registerForm.firstName} onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-stone-500 tracking-wider">Last Name</Label>
                <Input placeholder="Doe" value={registerForm.lastName} onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-stone-500 tracking-wider">Username</Label>
              <div className="relative">
                <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Input type="text" placeholder="username" value={registerForm.username} onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })} className="pl-11" />
              </div>
            </div>
            <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-stone-500 tracking-wider">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Input type="email" placeholder="your@email.com" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} required className="pl-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-stone-500 tracking-wider">Phone (optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Input type="tel" placeholder="+260 xxx xxx xxx" value={registerForm.phone} onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} className="pl-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-stone-500 tracking-wider">Password</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Create password" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} required className="pr-11" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-stone-500 tracking-wider">Confirm Password</Label>
              <Input type="password" placeholder="Confirm password" value={registerForm.confirmPassword} onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} required />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 font-bold shadow-lg shadow-emerald-500/20">
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : <><UserPlus className="w-4 h-4 mr-2" />Create Account</>}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
