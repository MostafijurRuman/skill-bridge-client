"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, ArrowRight, GraduationCap } from "lucide-react";
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

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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

        // Redirect to dashboard based on role or home
        if (response.user.role === "ADMIN") {
          router.push("/admin");
        } else if (response.user.role === "TUTOR") {
          router.push("/tutor/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: unknown) {
      console.error("Login Error:", error);
      const err = error as any;
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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC]">
      {/* Left Side - Illustration/Brand */}
      <div className="hidden md:flex md:w-1/2 bg-[#1E40AF] p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-[#2563EB]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] bg-[#14B8A6]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <Link href="/" className="flex items-center space-x-2 w-fit mb-12">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-[#2563EB]" />
              </div>
              <span className="font-bold text-2xl font-['Poppins',_sans-serif]">
                SkillBridge<span className="text-[#F59E0B]">.</span>
              </span>
            </Link>

            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold font-['Poppins',_sans-serif] leading-tight">
                Welcome back to your learning journey
              </h1>
              <p className="text-lg text-[#F8FAFC]/80 max-w-md font-['Inter',_sans-serif]">
                Connect with expert tutors, master new skills, and accelerate your career growth today.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center space-x-4 text-sm font-medium">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  src={`https://i.pravatar.cc/100?img=${i + 10}`}
                  alt="Student"
                  className="w-10 h-10 rounded-full border-2 border-[#1E40AF] object-cover"
                />
              ))}
            </div>
            <p>Join 10k+ learners already learning</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8 relative z-10 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-[#E2E8F0] md:border-none md:shadow-none md:bg-transparent md:p-0">

          <div className="md:hidden mb-8 flex justify-center">
            <Link href="/" className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-[#2563EB]" />
              <span className="font-bold text-2xl text-[#1E40AF] font-['Poppins',_sans-serif]">
                SkillBridge
              </span>
            </Link>
          </div>

          <div className="text-center md:text-left space-y-2">
            <h2 className="text-3xl font-bold text-[#0F172A] font-['Poppins',_sans-serif]">
              Sign in
            </h2>
            <p className="text-[#475569] font-['Inter',_sans-serif]">
              Enter your email and password to access your account.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0F172A] font-medium">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-[#475569]/50" />
                          </div>
                          <Input
                            placeholder="name@example.com"
                            className="pl-10 h-12 bg-[#F8FAFC] border-[#E2E8F0] focus-visible:ring-[#2563EB] rounded-xl text-base"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[#EF4444]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-[#0F172A] font-medium">Password</FormLabel>
                        <Link href="/forgot-password" className="text-sm font-medium text-[#2563EB] hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-[#475569]/50" />
                          </div>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 h-12 bg-[#F8FAFC] border-[#E2E8F0] focus-visible:ring-[#2563EB] rounded-xl text-base"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[#EF4444]" />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#2563EB] hover:bg-[#1E40AF] text-white rounded-xl font-bold text-base shadow-md transition-all flex items-center justify-center group"
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
            </form>
          </Form>

          <div className="mt-8 text-center text-sm text-[#475569] font-['Inter',_sans-serif]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-[#2563EB] hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
