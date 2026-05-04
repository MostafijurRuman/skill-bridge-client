import Link from "next/link";
import { BookOpen, Calendar, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Blog | SkillBridge",
  description: "Read the latest news, tips, and insights from the SkillBridge team and our expert tutors.",
};

// Dummy blog posts for the UI
const blogPosts = [
  {
    id: 1,
    title: "10 Proven Strategies to Master a New Language Quickly",
    excerpt: "Learning a new language can be daunting, but with these ten science-backed strategies, you'll be speaking fluently faster than you thought possible.",
    category: "Language Learning",
    author: "Maria Garcia",
    date: "Oct 12, 2023",
    imageUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "The Future of Web Development in 2024",
    excerpt: "Explore the emerging trends, frameworks, and tools that are set to redefine how we build applications on the web this year.",
    category: "Programming",
    author: "David Chen",
    date: "Nov 05, 2023",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "How to Overcome Math Anxiety",
    excerpt: "Math anxiety affects millions of students. Here is a practical guide on how to shift your mindset and tackle complex problems with confidence.",
    category: "Mathematics",
    author: "Sarah Johnson",
    date: "Dec 18, 2023",
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    title: "Effective Time Management for Online Learners",
    excerpt: "Balancing work, life, and online studies is challenging. Discover the Pomodoro technique and other scheduling methods to boost your productivity.",
    category: "Study Tips",
    author: "Emily Wong",
    date: "Jan 22, 2024",
    imageUrl: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Blog Header */}
      <section className="py-24 px-4 bg-muted/20 border-b border-border text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-heading tracking-tight">
            The SkillBridge <span className="text-primary">Blog</span>
          </h1>
          <p className="text-lg text-muted-foreground font-sans">
            Insights, tutorials, and success stories to inspire your learning journey.
          </p>
        </div>
      </section>

      {/* Featured Post (Optional layout highlight) */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="h-64 md:h-auto overflow-hidden relative">
            <img 
              src={blogPosts[0].imageUrl} 
              alt={blogPosts[0].title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Featured
            </div>
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1"><User className="w-4 h-4" /> {blogPosts[0].author}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {blogPosts[0].date}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4 group-hover:text-primary transition-colors">
              <Link href="#">{blogPosts[0].title}</Link>
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {blogPosts[0].excerpt}
            </p>
            <Button asChild variant="outline" className="w-fit rounded-xl font-bold">
              <Link href="#">Read Article <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Recent Posts Grid */}
      <section className="py-12 px-4 pb-24 max-w-7xl mx-auto">
        <h3 className="text-2xl font-bold font-heading mb-8">Recent Articles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1).map((post) => (
            <article key={post.id} className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm text-foreground text-xs font-bold px-3 py-1 rounded-full">
                  {post.category}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {post.author}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
                </div>
                <h4 className="text-xl font-bold font-heading mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  <Link href="#">{post.title}</Link>
                </h4>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
                  {post.excerpt}
                </p>
                <div className="mt-auto">
                  <Link href="#" className="inline-flex items-center text-sm font-bold text-primary hover:text-primary-dark transition-colors">
                    Read more <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
