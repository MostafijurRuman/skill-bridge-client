"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, ArrowRight, GraduationCap, Eye, EyeOff } from "lucide-react";
import { setCookie } from "cookies-next";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginUser } from "@/services/auth";
import Swal from 'sweetalert2';

// 1. Define your schema.
const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const isSafeRedirectPath = (path: string | null): path is string =>
  typeof path === "string" &&
  path.startsWith("/") &&
  !path.startsWith("//") &&
  !path.startsWith("/login") &&
  !path.startsWith("/register");

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 2. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 3. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await loginUser(values);
      if (response && response.token && response.user) {
        // Handle successful login
        // Assuming your backend returns token and user object as described
        setCookie("token", response.token, { maxAge: 60 * 60 * 24 * 7 }); // 7 days
        setCookie("user", JSON.stringify(response.user), { maxAge: 60 * 60 * 24 * 7 });

        // Show success alert
        Swal.fire({
          icon: 'success',
          title: 'Welcome back!',
          text: 'You have successfully logged in.',
          confirmButtonColor: '#2563EB',
          timer: 2000,
          showConfirmButton: false,
        });

        // Trigger a re-render by updating window location or firing event
        window.dispatchEvent(new Event("auth-change"));

        const redirectPath =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("redirect")
            : null;
        const defaultPath =
          response.user.role === "ADMIN"
            ? "/admin"
            : response.user.role === "TUTOR"
              ? "/tutor/dashboard"
              : "/dashboard";

        // If user came from a specific page, send them back there after login.
        router.replace(isSafeRedirectPath(redirectPath) ? redirectPath : defaultPath);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: unknown) {
      console.error("Login Error:", error);
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.response?.data?.message || 'Invalid email or password. Please try again.',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left Side - Illustration/Brand */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary to-blue-800 dark:from-slate-900 dark:to-slate-950 p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-white/10 dark:bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <Link href="/" className="flex items-center space-x-2 w-fit mb-12 group">
              <div className="w-10 h-10 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-2xl font-heading tracking-tight">
                SkillBridge<span className="text-accent">.</span>
              </span>
            </Link>

            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold font-heading leading-tight drop-shadow-sm">
                Welcome back to your learning journey
              </h1>
              <p className="text-lg text-white/80 max-w-md font-sans leading-relaxed">
                Connect with expert tutors, master new skills, and accelerate your career growth today.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center space-x-4 text-sm font-medium bg-white/10 dark:bg-white/5 backdrop-blur-md w-fit px-4 py-3 rounded-2xl border border-white/10">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  src={`https://i.pravatar.cc/100?img=${i + 10}`}
                  alt="Student"
                  className="w-10 h-10 rounded-full border-2 border-primary dark:border-background object-cover"
                />
              ))}
            </div>
            <p className="text-white/90">Join 10k+ learners already learning</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Subtle background glow for dark mode right side */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md space-y-8 relative z-10 bg-card md:bg-transparent p-8 sm:p-10 rounded-3xl shadow-xl md:shadow-none border border-border md:border-none">

          <div className="md:hidden mb-8 flex justify-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <span className="font-bold text-2xl text-foreground font-heading tracking-tight">
                SkillBridge<span className="text-primary">.</span>
              </span>
            </Link>
          </div>

          <div className="text-center md:text-left space-y-3">
            <h2 className="text-3xl font-bold text-foreground font-heading tracking-tight">
              Sign in
            </h2>
            <p className="text-muted-foreground font-sans text-sm md:text-base">
              Enter your email and password to access your account.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium ml-1">Email</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          </div>
                          <Input
                            placeholder="name@example.com"
                            className="pl-11 h-14 bg-muted/50 border-border focus-visible:ring-primary focus-visible:border-primary rounded-2xl text-base transition-all"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-destructive ml-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between ml-1 mb-1">
                        <FormLabel className="text-foreground font-medium mb-0">Password</FormLabel>
                        <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          </div>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-11 pr-12 h-14 bg-muted/50 border-border focus-visible:ring-primary focus-visible:border-primary rounded-2xl text-base transition-all"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-destructive ml-1" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-primary to-blue-500 hover:from-primary-dark hover:to-primary text-white rounded-2xl font-bold text-base shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] transition-all flex items-center justify-center group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-5 w-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-8 text-center text-sm text-muted-foreground font-sans">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-primary hover:text-primary-dark transition-colors hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
