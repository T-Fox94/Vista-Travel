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
          <div className="flex gap-2 mb-4">
            <button onClick={() => setActiveTab("login")} className={cn("flex-1 py-2 rounded-full text-sm font-medium", activeTab === "login" ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-600")}>
              Login
            </button>
            <button onClick={() => setActiveTab("register")} className={cn("flex-1 py-2 rounded-full text-sm font-medium", activeTab === "register" ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-600")}>
              Register
            </button>
          </div>
        )}

        {showForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-sm text-gray-500 text-center">Enter your email to receive a password reset link.</p>
            <div>
              <Label>Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 w-4 h-4 text-gray-400" />
                <Input type="email" placeholder="your@email.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required className="pl-10" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForgotPassword(false)} className="flex-1">Back</Button>
              <Button type="submit" disabled={isLoading} className="flex-1 bg-emerald-600 hover:bg-emerald-700">{isLoading ? "Sending..." : "Send Link"}</Button>
            </div>
          </form>
        ) : activeTab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label>Email or Username</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 w-4 h-4 text-gray-400" />
                <Input type="text" placeholder="you or you@example.com" value={loginForm.identifier} onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })} required className="pl-10" />
              </div>
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative mt-1">
                <Input type={showPassword ? "text" : "password"} placeholder="Enter password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required className="pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <button type="button" onClick={() => setShowForgotPassword(true)} className="text-emerald-600 hover:underline">Forgot password?</button>
              <button type="button" onClick={() => setActiveTab("register")} className="text-gray-500 hover:text-gray-700">Create account</button>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Signing in...</> : <><LogIn className="w-4 h-4 mr-2" />Sign In</>}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>First Name</Label>
                <Input placeholder="John" value={registerForm.firstName} onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })} required />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input placeholder="Doe" value={registerForm.lastName} onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })} required />
              </div>
            </div>
            <div>
              <Label>Username (optional)</Label>
              <div className="relative mt-1">
                <UserPlus className="absolute left-3 top-1/2 w-4 h-4 text-gray-400" />
                <Input type="text" placeholder="username" value={registerForm.username} onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })} className="pl-10" />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 w-4 h-4 text-gray-400" />
                <Input type="email" placeholder="your@email.com" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} required className="pl-10" />
              </div>
            </div>
            <div>
              <Label>Phone (optional)</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 w-4 h-4 text-gray-400" />
                <Input type="tel" placeholder="+260 xxx xxx xxx" value={registerForm.phone} onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} className="pl-10" />
              </div>
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative mt-1">
                <Input type={showPassword ? "text" : "password"} placeholder="Create password" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} required className="pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input type="password" placeholder="Confirm password" value={registerForm.confirmPassword} onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} required />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : <><UserPlus className="w-4 h-4 mr-2" />Create Account</>}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
