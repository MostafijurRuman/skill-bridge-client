import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-slate-900 dark:bg-background text-white pt-16 pb-8 border-t border-transparent dark:border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Brand Info */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold font-heading text-primary">
                            SkillBridge<span className="text-accent">.</span>
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                            Empowering learners worldwide by connecting them with expert tutors. Master the skills of tomorrow, today.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <Link href="#" className="w-10 h-10 rounded-full bg-slate-800 dark:bg-muted flex items-center justify-center text-slate-400 dark:text-muted-foreground hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors">
                                <Facebook size={20} />
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-slate-800 dark:bg-muted flex items-center justify-center text-slate-400 dark:text-muted-foreground hover:bg-info hover:text-white dark:hover:bg-info transition-colors">
                                <Twitter size={20} />
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-slate-800 dark:bg-muted flex items-center justify-center text-slate-400 dark:text-muted-foreground hover:bg-secondary hover:text-white dark:hover:bg-secondary transition-colors">
                                <Instagram size={20} />
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-slate-800 dark:bg-muted flex items-center justify-center text-slate-400 dark:text-muted-foreground hover:bg-primary-dark hover:text-white dark:hover:bg-primary-dark transition-colors">
                                <Linkedin size={20} />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold font-heading mb-6 text-white border-b border-slate-700 pb-2 inline-block">Explore</h3>
                        <ul className="space-y-3 text-slate-400 text-sm">
                            <li><Link href="/tutors" className="hover:text-secondary transition-colors flex items-center space-x-2"><span className="w-1.5 h-1.5 rounded-full bg-secondary"></span><span>Browse Tutors</span></Link></li>
                            <li><Link href="/#categories" className="hover:text-secondary transition-colors flex items-center space-x-2"><span className="w-1.5 h-1.5 rounded-full bg-secondary"></span><span>Top Subjects</span></Link></li>
                            <li><Link href="/about" className="hover:text-secondary transition-colors flex items-center space-x-2"><span className="w-1.5 h-1.5 rounded-full bg-secondary"></span><span>About Us</span></Link></li>
                            <li><Link href="/#how-it-works" className="hover:text-secondary transition-colors flex items-center space-x-2"><span className="w-1.5 h-1.5 rounded-full bg-secondary"></span><span>How It Works</span></Link></li>
                        </ul>
                    </div>

                    {/* Community */}
                    <div>
                        <h3 className="text-lg font-semibold font-heading mb-6 text-white border-b border-slate-700 pb-2 inline-block">Community</h3>
                        <ul className="space-y-3 text-slate-400 text-sm">
                            <li><Link href="/register?role=student" className="hover:text-accent transition-colors flex items-center space-x-2"><span className="w-1.5 h-1.5 rounded-full bg-accent"></span><span>Join as Student</span></Link></li>
                            <li><Link href="/register?role=tutor" className="hover:text-accent transition-colors flex items-center space-x-2"><span className="w-1.5 h-1.5 rounded-full bg-accent"></span><span>Become a Tutor</span></Link></li>
                            <li><Link href="/blog" className="hover:text-accent transition-colors flex items-center space-x-2"><span className="w-1.5 h-1.5 rounded-full bg-accent"></span><span>Education Blog</span></Link></li>
                            <li><Link href="/help" className="hover:text-accent transition-colors flex items-center space-x-2"><span className="w-1.5 h-1.5 rounded-full bg-accent"></span><span>Help Center</span></Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold font-heading mb-6 text-white border-b border-slate-700 pb-2 inline-block">Contact</h3>
                        <ul className="space-y-4 text-slate-400 text-sm">
                            <li className="flex items-start space-x-3">
                                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <span>123 Learning Ave, Knowledge City, ED 90210</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Phone className="w-5 h-5 text-primary shrink-0" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Mail className="w-5 h-5 text-primary shrink-0" />
                                <span>support@skillbridge.edu</span>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} SkillBridge. All rights reserved.</p>
                    <div className="flex space-x-6">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
