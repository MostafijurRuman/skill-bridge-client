import { HelpCircle, Mail, Phone, MessageCircle, FileText, ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Help Center | SkillBridge",
  description: "Get support and answers to your questions about SkillBridge.",
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 px-4 border-b border-border">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-heading tracking-tight">
            How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">help</span> you?
          </h1>
          <p className="text-xl text-muted-foreground font-sans leading-relaxed max-w-2xl mx-auto">
            Find answers, browse guides, and contact support to make the most out of your SkillBridge experience.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-24 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-heading">Get in Touch</h2>
            <p className="text-muted-foreground text-lg">We're here to help. Choose the best way to reach us.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm text-center space-y-4 hover:shadow-md transition-all">
              <Mail className="w-10 h-10 text-primary mx-auto" />
              <h3 className="text-2xl font-bold font-heading">Email Support</h3>
              <p className="text-muted-foreground font-medium">support@skillbridge.edu</p>
              <Button asChild variant="outline" className="mt-4 w-full rounded-xl"><a href="mailto:support@skillbridge.edu">Send an Email</a></Button>
            </div>
            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm text-center space-y-4 hover:shadow-md transition-all">
              <Phone className="w-10 h-10 text-secondary mx-auto" />
              <h3 className="text-2xl font-bold font-heading">Call Us</h3>
              <p className="text-muted-foreground font-medium">+1 (555) 123-4567</p>
              <Button asChild variant="outline" className="mt-4 w-full rounded-xl"><a href="tel:+15551234567">Call Now</a></Button>
            </div>
            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm text-center space-y-4 hover:shadow-md transition-all">
              <MessageCircle className="w-10 h-10 text-accent mx-auto" />
              <h3 className="text-2xl font-bold font-heading">Live Chat</h3>
              <p className="text-muted-foreground font-medium">Available 24/7</p>
              <Button disabled variant="outline" className="mt-4 w-full rounded-xl">Coming Soon</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Knowledge Base */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-heading">Common Issues</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "How do I book my first tutoring session?", a: "To book your first session, search for a tutor in your desired subject, choose an available time slot from their calendar, and confirm your booking with a secure payment." },
              { q: "What is the refund and cancellation policy?", a: "You can cancel or reschedule a session up to 24 hours before the scheduled time for a full refund. Cancellations within 24 hours may be subject to a fee." },
              { q: "How do I become a verified tutor?", a: "To become a verified tutor, go to the 'Become a Tutor' page, submit your application, provide your credentials, and complete our background check and interview process." },
              { q: "What do I do if I have video call issues?", a: "Ensure you are using a supported browser (Chrome, Firefox, Safari) and have a stable internet connection. You can also try restarting your browser or clearing your cache." },
              { q: "How do I manage my payment methods?", a: "You can manage your payment methods by going to your dashboard, navigating to the 'Billing' section, and adding or removing cards securely." }
            ].map((faq, i) => (
              <details key={i} className="group border border-border rounded-2xl bg-card overflow-hidden hover:border-border/80 hover:shadow-sm transition-all">
                <summary className="flex items-center justify-between p-6 font-bold font-heading text-lg cursor-pointer list-none [&::-webkit-details-marker]:hidden hover:text-primary transition-colors">
                  {faq.q}
                  <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform duration-300" />
                </summary>
                <div className="px-6 pb-6 pt-0 text-muted-foreground leading-relaxed animate-in slide-in-from-top-2 fade-in duration-300">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
