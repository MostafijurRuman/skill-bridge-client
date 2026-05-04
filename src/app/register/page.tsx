"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, GraduationCap, BookOpen, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialRole = searchParams.get("role")?.toUpperCase() === "TUTOR" ? "TUTOR" : "STUDENT";

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: initialRole,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Sync role if URL param changes
        const role = searchParams.get("role")?.toUpperCase() === "TUTOR" ? "TUTOR" : "STUDENT";
        setFormData(prev => ({ ...prev, role }));
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (role: "STUDENT" | "TUTOR") => {
        setFormData({ ...formData, role });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
            const response = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    emailVerified: true // Set to true as requested for testing
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong during registration.");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 2000);

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to register. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center space-y-6 py-12"
            >
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-10 h-10 text-success" />
                </div>
                <h2 className="text-3xl font-bold font-heading text-foreground">Welcome to SkillBridge!</h2>
                <p className="text-muted-foreground text-lg max-w-md">
                    Your account has been created successfully. Redirecting you to login...
                </p>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md mx-auto">
            <div className="space-y-2 text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground tracking-tight">Create an Account</h1>
                <p className="text-muted-foreground font-sans">Join our community and start your journey.</p>
            </div>

            {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium text-center border border-destructive/20">
                    {error}
                </div>
            )}

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div
                    onClick={() => handleRoleSelect("STUDENT")}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center space-y-2 ${formData.role === "STUDENT" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30 dark:hover:bg-primary/5"}`}
                >
                    <div className={`p-3 rounded-full transition-colors ${formData.role === "STUDENT" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="block font-bold text-foreground">Student</span>
                        <span className="text-xs text-muted-foreground">I want to learn</span>
                    </div>
                </div>

                <div
                    onClick={() => handleRoleSelect("TUTOR")}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center space-y-2 ${formData.role === "TUTOR" ? "border-secondary bg-secondary/5 shadow-sm" : "border-border hover:border-secondary/30 dark:hover:bg-secondary/5"}`}
                >
                    <div className={`p-3 rounded-full transition-colors ${formData.role === "TUTOR" ? "bg-secondary text-white" : "bg-muted text-muted-foreground"}`}>
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="block font-bold text-foreground">Tutor</span>
                        <span className="text-xs text-muted-foreground">I want to teach</span>
                    </div>
                </div>
            </div>

            <div className="space-y-5">
                <div className="space-y-2 relative">
                    <label className="text-sm font-medium text-foreground ml-1">Full Name</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className="w-full pl-11 pr-4 py-3 h-14 bg-muted/50 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                        />
                    </div>
                </div>

                <div className="space-y-2 relative">
                    <label className="text-sm font-medium text-foreground ml-1">Email Address</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            className="w-full pl-11 pr-4 py-3 h-14 bg-muted/50 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                        />
                    </div>
                </div>

                <div className="space-y-2 relative">
                    <label className="text-sm font-medium text-foreground ml-1">Password</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            required
                            minLength={6}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full pl-11 pr-12 py-3 h-14 bg-muted/50 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 h-14 text-lg rounded-2xl bg-gradient-to-r from-primary to-blue-500 hover:from-primary-dark hover:to-primary text-white shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] transition-all flex items-center justify-center space-x-2 group"
            >
                {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                    <>
                        <span>Create Account</span>
                        <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </Button>

            <p className="text-center text-muted-foreground text-sm pt-4 font-sans">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-bold hover:text-primary-dark hover:underline transition-colors">
                    Sign in here
                </Link>
            </p>
        </form>
    );
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex bg-background">
            {/* Left Side - Image/Branding */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary to-blue-800 dark:from-slate-900 dark:to-slate-950 relative overflow-hidden items-center justify-center">
                {/* Abstract Background Design */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 -left-1/4 w-full h-full bg-white/10 dark:bg-primary/30 rounded-full blur-3xl opacity-50 transform -translate-y-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 -right-1/4 w-full h-full bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-3xl opacity-50 transform translate-y-1/2 pointer-events-none"></div>
                </div>

                <div className="relative z-10 px-16 text-center text-white space-y-8">
                    <Link href="/" className="inline-flex mb-8 group items-center space-x-2">
                        <div className="w-10 h-10 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform">
                            <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold font-heading tracking-tight">
                            SkillBridge<span className="text-accent">.</span>
                        </h2>
                    </Link>
                    <h3 className="text-3xl md:text-5xl font-bold font-heading leading-tight drop-shadow-sm">
                        Start your <br /> learning journey today.
                    </h3>
                    <p className="text-white/80 text-lg max-w-md mx-auto font-sans leading-relaxed">
                        Connect with expert tutors, master new skills, and achieve your goals safely and securely.
                    </p>

                    <div className="pt-12 grid grid-cols-2 gap-8 text-left max-w-md mx-auto">
                        <div className="space-y-2">
                            <div className="w-12 h-12 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-success" />
                            </div>
                            <h4 className="font-bold">Verified Tutors</h4>
                            <p className="text-sm text-white/70">100% manually vetted</p>
                        </div>
                        <div className="space-y-2">
                            <div className="w-12 h-12 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-success" />
                            </div>
                            <h4 className="font-bold">Secure Booking</h4>
                            <p className="text-sm text-white/70">Safe online payments</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
                {/* Subtle background glow for dark mode right side */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

                {/* Mobile branding header */}
                <div className="absolute top-8 left-8 lg:hidden block z-20">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                            <GraduationCap className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold font-heading text-foreground tracking-tight">
                            SkillBridge<span className="text-primary">.</span>
                        </h2>
                    </Link>
                </div>

                <div className="w-full max-w-md bg-card md:bg-transparent p-8 md:p-0 rounded-3xl shadow-xl md:shadow-none border border-border md:border-none relative z-10 my-16">
                    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
                        <RegisterForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
