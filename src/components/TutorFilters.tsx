"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

import { getAllCategories, Category } from "@/services/categories";

const fallbackCategories: Category[] = [
    { id: "cddb9e42-2b16-445b-8184-1436710da1f0", name: "Mathematics" },
    { id: "a36cc387-5815-4bc4-ae52-817c82d22dc8", name: "Physics" },
    { id: "c2ddcbcd-c17f-4c0e-b10d-18517bddcb04", name: "Chemistry" },
    { id: "b4121a09-a75c-459f-9057-ef9628542ae4", name: "Biology" },
    { id: "89c43341-e3c2-4fb5-9c51-16b235c6fe62", name: "Computer Science" },
    { id: "21f71e4a-cea8-4ee4-97ce-d10814e03eb7", name: "English Literature" },
    { id: "77e421fa-5c47-4b8b-a776-a974ccf5fb81", name: "History" },
    { id: "1017ccca-25a7-412c-9d41-aed440bff60d", name: "Geography" },
    { id: "979db2f1-71f9-47b8-a749-5f4e6cb7c057", name: "Music Theory" },
    { id: "24606d31-ebdb-4d5e-a628-bcb793296091", name: "Visual Arts" }
];

export default function TutorFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [category, setCategory] = useState(searchParams.get("category") || "");
    const [price, setPrice] = useState(searchParams.get("price") || "");
    const [rating, setRating] = useState(searchParams.get("rating") || "");
    const [dbCategories, setDbCategories] = useState<Category[]>([]);

    React.useEffect(() => {
        getAllCategories().then(data => {
            if (data && data.length > 0) {
                setDbCategories(data);
            } else {
                setDbCategories(fallbackCategories);
            }
        }).catch(err => {
            setDbCategories(fallbackCategories);
        });
    }, []);


    const applyFilters = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());

        if (category) {
            params.set("category", category);
        } else {
            params.delete("category");
        }

        if (price) {
            params.set("price", price);
        } else {
            params.delete("price");
        }

        if (rating) {
            params.set("rating", rating);
        } else {
            params.delete("rating");
        }

        router.push(`${pathname}?${params.toString()}`);
    };

    const clearFilters = () => {
        setCategory("");
        setPrice("");
        setRating("");
        router.push(pathname);
    };

    return (
        <form onSubmit={applyFilters} className="bg-card dark:bg-card/40 dark:backdrop-blur-xl p-6 rounded-3xl border border-border shadow-sm dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] space-y-6">
            <div className="flex items-center space-x-2 pb-4 border-b border-border">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-bold text-lg text-foreground">Filter Tutors</h3>
            </div>

            <div className="space-y-5">
                {/* Category */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground ml-1">Category</label>
                    <div className="relative">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className={`w-full bg-background border ${category ? 'border-primary ring-1 ring-primary/20' : 'border-border'} text-foreground rounded-2xl px-4 py-3 pl-10 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer`}
                        >
                            <option value="">All Categories</option>
                            {dbCategories.map((cat) => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground ml-1">Max Price / Hr</label>
                    <div className="relative">
                        <input
                            type="number"
                            min="0"
                            placeholder="e.g. 50"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className={`w-full bg-background border ${price ? 'border-primary ring-1 ring-primary/20' : 'border-border'} text-foreground rounded-2xl px-4 py-3 pl-10 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all`}
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">$</span>
                    </div>
                </div>

                {/* Rating */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground ml-1">Minimum Rating</label>
                    <div className="relative">
                        <select
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                            className={`w-full bg-background border ${rating ? 'border-primary ring-1 ring-primary/20' : 'border-border'} text-foreground rounded-2xl px-4 py-3 pl-10 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer`}
                        >
                            <option value="">Any Rating</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4+ Stars</option>
                            <option value="3">3+ Stars</option>
                        </select>
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent fill-accent/20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3 pt-6 border-t border-border">
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-blue-500 hover:from-primary-dark hover:to-primary text-white rounded-2xl h-12 shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] transition-all font-bold text-base">
                    Apply Filters
                </Button>
                <Button type="button" variant="outline" onClick={clearFilters} className="w-full rounded-2xl h-12 border-border text-muted-foreground hover:text-foreground hover:bg-muted font-semibold transition-all">
                    Clear All
                </Button>
            </div>
        </form>
    );
}
