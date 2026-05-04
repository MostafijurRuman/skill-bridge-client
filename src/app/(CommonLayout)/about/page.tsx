import Link from "next/link";
import { GraduationCap, Users, Shield, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About Us | SkillBridge",
  description: "Learn more about SkillBridge, our mission, and the team behind the platform.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 px-4 border-b border-border">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-heading tracking-tight">
            Bridging the gap between <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">ambition</span> and <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">mastery</span>.
          </h1>
          <p className="text-xl text-muted-foreground font-sans leading-relaxed max-w-2xl mx-auto">
            SkillBridge was founded with a simple mission: to make high-quality, personalized education accessible to everyone, everywhere.
          </p>
        </div>
      </section>

      {/* Stats/Values Section */}
      <section className="py-24 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm text-center space-y-4 hover:shadow-md transition-all">
              <Users className="w-10 h-10 text-primary mx-auto" />
              <h3 className="text-3xl font-bold font-heading">10k+</h3>
              <p className="text-muted-foreground font-medium">Active Students</p>
            </div>
            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm text-center space-y-4 hover:shadow-md transition-all">
              <GraduationCap className="w-10 h-10 text-secondary mx-auto" />
              <h3 className="text-3xl font-bold font-heading">1,000+</h3>
              <p className="text-muted-foreground font-medium">Expert Tutors</p>
            </div>
            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm text-center space-y-4 hover:shadow-md transition-all">
              <Award className="w-10 h-10 text-accent mx-auto" />
              <h3 className="text-3xl font-bold font-heading">98%</h3>
              <p className="text-muted-foreground font-medium">Satisfaction Rate</p>
            </div>
            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm text-center space-y-4 hover:shadow-md transition-all">
              <Shield className="w-10 h-10 text-success mx-auto" />
              <h3 className="text-3xl font-bold font-heading">100%</h3>
              <p className="text-muted-foreground font-medium">Secure Platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold font-heading">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                We started SkillBridge because we believed that the traditional classroom model isn&apos;t enough for everyone. People learn differently, at different paces, and need diverse approaches to truly understand complex subjects.
              </p>
              <p>
                By connecting passionate educators directly with eager learners, we eliminate the barriers of geography and scheduling, creating a vibrant marketplace for knowledge exchange.
              </p>
            </div>
            <Button asChild className="mt-4 bg-primary text-white font-bold rounded-xl h-12 px-6">
              <Link href="/register">Join Our Community <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
          <div className="relative">
            <div className="aspect-square bg-muted rounded-[3rem] border border-border overflow-hidden relative shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-500/20 mix-blend-overlay"></div>
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Students collaborating" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-card border border-border rounded-3xl p-6 shadow-xl hidden md:flex flex-col justify-center items-center text-center">
              <span className="text-4xl font-bold text-primary mb-2">5+</span>
              <span className="font-bold text-foreground">Years of Excellence</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
