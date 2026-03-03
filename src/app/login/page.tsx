"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { User, GraduationCap, Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { getStudents } from "@/lib/storage";
import Image from "next/image";
import logo from "../logo.png";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get("role") || "student";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both your email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      if (role === "instructor") {
        // Default instructor login for demo purposes
        if (
          email === "admin@acuard.edu" ||
          (email === "admin@academiaguard.edu" && password === "admin123")
        ) {
          router.push("/instructor/dashboard");
          toast({
            title: "Welcome, Instructor",
            description: "You have successfully accessed the control panel.",
          });
        } else {
          toast({
            title: "Login Failed",
            description:
              "Invalid instructor credentials. For demo, use admin@acuard.edu / admin123",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      } else {
        // Student login check against storage
        const students = getStudents();
        const foundStudent = students.find(
          (s) => s.email === email && s.password === password,
        );

        if (foundStudent) {
          // Store session for student identification
          localStorage.setItem(
            "ag_current_user",
            JSON.stringify({
              id: foundStudent.id,
              name: foundStudent.name,
              email: foundStudent.email,
            }),
          );

          router.push("/student/dashboard");
          toast({
            title: "Login Successful",
            description: `Welcome back, ${foundStudent.name}.`,
          });
        } else {
          toast({
            title: "Login Failed",
            description:
              "Invalid email or password. Please check your credentials.",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-2xl border-none ring-1 ring-slate-200">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 flex items-center justify-center relative">
              <Image
                src={logo}
                alt="Acuard Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <CardTitle className="text-3xl font-headline font-bold text-slate-900">
            Acuard
          </CardTitle>
          <CardDescription>
            Secure access to the{" "}
            <span className="font-bold text-primary">{role}</span> portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@university.edu"
                  className="pl-10 h-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs text-primary"
                >
                  Forgot password?
                </Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              className="w-full h-12 text-base font-bold flex items-center gap-3 mt-2"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {role === "instructor" ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <GraduationCap className="w-5 h-5" />
                  )}
                  Sign in as {role.charAt(0).toUpperCase() + role.slice(1)}
                </>
              )}
            </Button>

            <div className="relative pt-4">
              <div className="absolute inset-0 flex items-center px-4">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                <span className="bg-white px-3 text-muted-foreground">
                  Portal Selection
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-11 border-slate-200 hover:bg-slate-50 text-slate-600 font-medium"
              onClick={() => {
                setEmail("");
                setPassword("");
                router.push(
                  `/login?role=${role === "instructor" ? "student" : "instructor"}`,
                );
              }}
              disabled={isLoading}
            >
              Switch to {role === "instructor" ? "Student" : "Instructor"}{" "}
              Portal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
