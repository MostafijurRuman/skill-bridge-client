"use client";
import { Navbar } from '@/components/ui/shared/Navbar'
import { Footer } from "@/components/ui/shared/Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    )
}
