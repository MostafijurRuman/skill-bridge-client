"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Search,
  Star,
  BookOpen,
  Code,
  Globe,
  Calculator,
  FlaskConical,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  Users,
  Award
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

import { useEffect, useState } from "react";
import { getAllTutors } from "@/services/tutors";
import { getAllCategories, Category } from "@/services/categories";
import TutorCard from "@/components/TutorCard";
import { TutorType } from "@/types/tutor";

const fallbackTutors: TutorType[] = [
  {
    id: "1",
    userId: "u1",
    bio: "Passionate about making calculus intuitive and fun.",
    pricePerHr: 40,
    rating: 4.9,
    user: {
      id: "u1", name: "Sarah Johnson", email: "sarah@example.com", password: null, role: "TUTOR", isBanned: false, bannedAt: null, emailVerified: true, image: "https://i.pravatar.cc/150?u=sarah", createdAt: "", updatedAt: ""
    },
    categories: [{ id: "c1", name: "Advanced Calculus" }]
  },
  {
    id: "2",
    userId: "u2",
    bio: "Expert in modern web development frameworks and tools.",
    pricePerHr: 55,
    rating: 5.0,
    user: {
      id: "u2", name: "David Chen", email: "david@example.com", password: null, role: "TUTOR", isBanned: false, bannedAt: null, emailVerified: true, image: "https://i.pravatar.cc/150?u=david", createdAt: "", updatedAt: ""
    },
    categories: [{ id: "c2", name: "Full Stack Dev" }]
  },
  {
    id: "3",
    userId: "u3",
    bio: "Bringing Spanish literature to life through engaging discussions.",
    pricePerHr: 30,
    rating: 4.8,
    user: {
      id: "u3", name: "Maria Garcia", email: "maria@example.com", password: null, role: "TUTOR", isBanned: false, bannedAt: null, emailVerified: true, image: "https://i.pravatar.cc/150?u=maria", createdAt: "", updatedAt: ""
    },
    categories: [{ id: "c3", name: "Spanish Literature" }]
  },
  {
    id: "4",
    userId: "u4",
    bio: "Demystifying the quantum realm step by step.",
    pricePerHr: 45,
    rating: 4.9,
    user: {
      id: "u4", name: "James Wilson", email: "james@example.com", password: null, role: "TUTOR", isBanned: false, bannedAt: null, emailVerified: true, image: null, createdAt: "", updatedAt: ""
    },
    categories: [{ id: "c4", name: "Quantum Physics" }]
  },
];

const categoryStyles = [
  { icon: Calculator, color: "bg-primary/10 text-primary", hover: "hover:bg-primary hover:text-white" },
  { icon: Code, color: "bg-secondary/10 text-secondary", hover: "hover:bg-secondary hover:text-white" },
  { icon: Globe, color: "bg-accent/10 text-accent", hover: "hover:bg-accent hover:text-white" },
  { icon: FlaskConical, color: "bg-info/10 text-info", hover: "hover:bg-info hover:text-white" },
  { icon: Briefcase, color: "bg-success/10 text-success", hover: "hover:bg-success hover:text-white" },
  { icon: BookOpen, color: "bg-primary-dark/10 text-primary-dark", hover: "hover:bg-primary-dark hover:text-white" },
];

const steps = [
  { title: "Find a Tutor", desc: "Search by subject, level, and price. Read verified reviews.", icon: Search },
  { title: "Book a Session", desc: "Choose a time that works for you from the tutor's availability.", icon: CheckCircle2 },
  { title: "Start Learning", desc: "Join your personalized session and master new skills fastest.", icon: TrendingUp },
];

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Assuming search maps to a category or general term
      router.push(`/tutors?category=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(`/tutors`);
    }
  };

  const [tutors, setTutors] = useState<TutorType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await getAllTutors();
        if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
          setTutors(response.data.slice(0, 4));
        } else if (response && Array.isArray(response) && response.length > 0) {
          setTutors(response.slice(0, 4));
        } else {
          setTutors(fallbackTutors);
        }
      } catch (error) {
        console.error(error);
        setTutors(fallbackTutors);
      } finally {
        setLoading(false);
      }
    };

    const fetchCats = async () => {
      const cats = await getAllCategories();
      if (cats && cats.length > 0) {
        setDbCategories(cats);
      } else {
        // Fallback temporary categories mapping if backend fails
        setDbCategories([
          { id: "1", name: "Mathematics" },
          { id: "2", name: "Programming" },
          { id: "3", name: "Languages" },
          { id: "4", name: "Sciences" },
          { id: "5", name: "Business" },
          { id: "6", name: "Humanities" },
        ]);
      }
    };

    fetchTutors();
    fetchCats();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">

      {/* SECTION 1: HERO */}
      <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 px-4 overflow-hidden">
        {/* Background Decorative Shapes */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8 max-w-4xl"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-border px-4 py-2 rounded-full shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-success"></span>
              <span className="text-sm font-medium text-muted-foreground">Over 1,000+ expert tutors online now</span>
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-bold font-heading text-foreground leading-tight tracking-tight">
              Master the Skills of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Tomorrow</span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-sans leading-relaxed">
              SkillBridge connects ambitious students with expert tutors. Fast-track your learning with personalized 1-on-1 sessions.
            </motion.p>

            <motion.div variants={fadeIn} className="w-full max-w-2xl mx-auto pt-4 relative">
              <form onSubmit={handleSearch} className="flex items-center bg-white rounded-2xl p-2 shadow-lg border border-border/50">
                <Search className="w-6 h-6 text-muted-foreground ml-3 mr-2" />
                <input
                  type="text"
                  placeholder="What do you want to learn today? (e.g. Business, Mathematics)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground px-2 h-12 truncate"
                />
                <Button type="submit" size="lg" className="bg-primary hover:bg-primary-dark text-white rounded-xl px-8 h-12 shadow-md transition-all">
                  Search
                </Button>
              </form>
            </motion.div>

            <motion.div variants={fadeIn} className="pt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground font-medium">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-secondary" /> Verified Tutors</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-secondary" /> Instant Booking</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-secondary" /> Secure Payments</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: CATEGORIES */}
      <section className="py-24 bg-white px-4 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">Explore Top Subjects</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Find the perfect tutor for your specific learning goals across our most popular categories.</p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          >
            {dbCategories.slice(0, 6).map((category, index) => {
              const style = categoryStyles[index % categoryStyles.length];
              const Icon = style.icon;
              return (
                <motion.div key={category.id} variants={fadeIn}>
                  <Link href={`/tutors?category=${encodeURIComponent(category.name)}`} className="group block h-full">
                    <div className="flex flex-col items-center justify-center p-6 bg-background rounded-2xl border border-border hover:shadow-xl transition-all duration-300 h-full group-hover:-translate-y-1">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${style.color} ${style.hover}`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <h3 className="font-heading font-semibold text-foreground text-center">{category.name}</h3>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: FEATURED TUTORS */}
      <section className="py-24 bg-background px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">Featured Expert Tutors</h2>
              <p className="text-muted-foreground text-lg max-w-2xl">Learn from the highest-rated professionals in our community.</p>
            </div>
            <Link href="/tutors" className="hidden md:inline-flex items-center text-primary font-medium hover:text-primary-dark transition-colors">
              View all tutors <span className="ml-2">→</span>
            </Link>
          </div>

          {loading ? (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-center py-12 text-muted-foreground">
              Loading top tutors...
            </div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 h-full"
            >
              {tutors.map((tutor) => (
                <div key={tutor.id} className="h-full">
                  <TutorCard tutor={tutor} />
                </div>
              ))}
            </motion.div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" className="rounded-xl px-8">
              View all tutors
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS */}
      <section className="py-24 bg-white px-4 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">How SkillBridge Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Your journey to mastery in just three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 z-0"></div>

            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  className="relative z-10 flex flex-col items-center text-center space-y-4"
                >
                  <div className="w-24 h-24 rounded-full bg-white shadow-xl border-4 border-white flex items-center justify-center mb-2 z-10 relative group">
                    <div className="absolute inset-0 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                    <Icon className="w-10 h-10 text-primary z-10" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary text-white font-bold flex items-center justify-center shadow-md">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="font-heading font-bold text-xl text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-sm">{step.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* SECTION 5: CTA / STATS */}
      <section className="py-20 bg-primary px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-0 bottom-0 -translate-x-1/4 translate-y-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <h2 className="text-3xl md:text-5xl font-bold font-heading text-white leading-tight">
                Ready to accelerate your learning journey?
              </h2>
              <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto lg:mx-0">
                Join thousands of students and tutors who are already transforming their careers and lives on SkillBridge.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button size="lg" className="bg-white text-primary hover:bg-background font-bold rounded-xl px-8 h-14 shadow-lg w-full sm:w-auto transition-all">
                  Join as Student
                </Button>
                <Button variant="outline" size="lg" className="border-white/30 text-white bg-blue-600 hover:bg-white hover:text-blue-600 font-bold rounded-xl px-8 h-14 shadow-sm w-full sm:w-auto transition-all">
                  Become a Tutor
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center"
              >
                <Users className="w-10 h-10 text-accent mx-auto mb-4" />
                <div className="text-4xl font-bold text-white mb-2 font-heading">10k+</div>
                <div className="text-white/80 font-medium">Active Students</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center"
              >
                <Award className="w-10 h-10 text-secondary mx-auto mb-4" />
                <div className="text-4xl font-bold text-white mb-2 font-heading">98%</div>
                <div className="text-white/80 font-medium">Satisfaction Rate</div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
