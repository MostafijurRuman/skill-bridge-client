"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TutorType } from "@/types/tutor";

interface TutorCardProps {
    tutor: TutorType;
}

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function TutorCard({ tutor }: TutorCardProps) {
    const getAvatarUrl = () => {
        if (tutor.user?.image) return tutor.user.image;
        // Default avatar fallback
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.user?.name || "Tutor")}&background=2563EB&color=fff&size=150`;
    };

    return (
        <motion.div variants={fadeIn} className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col h-full">
            <div className="h-24 bg-gradient-to-r from-primary/10 to-secondary/10 relative">
                <img
                    src={getAvatarUrl()}
                    alt={tutor.user?.name || "Tutor"}
                    className="w-20 h-20 rounded-full border-4 border-white absolute -bottom-10 left-6 object-cover bg-white shadow-sm"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.user?.name || "Tutor")}&background=2563EB&color=fff&size=150`;
                    }}
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-foreground px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                    ${tutor.pricePerHr}/hr
                </div>
            </div>
            <div className="pt-14 p-6 space-y-4 flex flex-col flex-1">
                <div>
                    <h3 className="font-heading font-bold text-lg text-foreground line-clamp-1">{tutor.user?.name}</h3>
                    <p className="text-secondary font-medium text-sm line-clamp-1">
                        {tutor.categories?.length > 0 ? tutor.categories.map(c => c.name).join(", ") : "Expert Tutor"}
                    </p>
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2">{tutor.bio}</p>
                <div className="flex items-center space-x-2 text-sm mt-auto pb-4 pt-2">
                    <Star className="w-4 h-4 text-accent fill-accent" />
                    <span className="font-bold text-foreground">{Number(tutor.rating || 0).toFixed(1)}</span>
                </div>
                <Link href={`/tutors/${tutor.id}`} className="w-full mt-auto">
                    <Button className="w-full bg-background text-foreground border border-border hover:bg-primary hover:text-white transition-all rounded-xl">
                        View Profile
                    </Button>
                </Link>
            </div>
        </motion.div>
    );
}
