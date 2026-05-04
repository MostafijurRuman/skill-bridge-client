"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, User, Tag, Clock, TrendingUp, X, Loader2 } from "lucide-react";
import { getGlobalSearch, SearchResults, SearchResultItem } from "@/services/search";
import { getAllCategories } from "@/services/categories";

export interface RecentSearch {
  text: string;
  type: string;
  id?: string;
}

const RECENT_SEARCHES_KEY = "skillbridge_recent_searches";
const MAX_RECENT_SEARCHES = 5;

// Hook for debouncing values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Utility to highlight text
const HighlightedText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) return <span>{text}</span>;

  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="font-bold text-primary dark:text-primary/90">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

export default function SmartSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load recent searches on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        // Handle migration from string[] to RecentSearch[]
        const parsed = JSON.parse(stored);
        if (parsed.length > 0 && typeof parsed[0] === 'string') {
          const migrated = parsed.map((s: string) => ({ text: s, type: 'search' }));
          setRecentSearches(migrated);
        } else {
          setRecentSearches(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load recent searches", e);
    }
  }, []);

  // Load trending searches (categories) on mount
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const cats = await getAllCategories();
        if (cats && cats.length > 0) {
          setTrendingSearches(cats.slice(0, 5).map(c => c.name));
        } else {
          setTrendingSearches(["Mathematics", "Physics", "Computer Science", "English Literature", "Business"]);
        }
      } catch (error) {
        setTrendingSearches(["Mathematics", "Physics", "Computer Science", "English Literature", "Business"]);
      }
    };
    fetchTrending();
  }, []);

  // Fetch results when debounced query changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults(null);
        return;
      }

      setIsLoading(true);
      try {
        const data = await getGlobalSearch(debouncedQuery);
        setResults(data);
        setActiveIndex(-1); // Reset keyboard navigation
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const saveRecentSearch = (item: RecentSearch) => {
    if (!item.text.trim()) return;
    try {
      const updatedSearches = [
        item,
        ...recentSearches.filter((s) => s.text.toLowerCase() !== item.text.toLowerCase()),
      ].slice(0, MAX_RECENT_SEARCHES);
      setRecentSearches(updatedSearches);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedSearches));
    } catch (e) {
      console.error("Failed to save recent search", e);
    }
  };

  const removeRecentSearch = (e: React.MouseEvent, searchText: string) => {
    e.stopPropagation();
    try {
      const updatedSearches = recentSearches.filter((s) => s.text !== searchText);
      setRecentSearches(updatedSearches);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedSearches));
    } catch (e) {
      console.error("Failed to remove recent search", e);
    }
  };

  const clearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const handleSelect = (itemText: string, type: string, id?: string) => {
    saveRecentSearch({ text: itemText, type, id });
    setQuery(itemText);
    setIsFocused(false);
    
    // Redirect logic
    if (type === "tutor" && id) {
       router.push(`/tutors/${id}`);
    } else {
       router.push(`/tutors?search=${encodeURIComponent(itemText)}`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch({ text: query.trim(), type: "search" });
      setIsFocused(false);
      router.push(`/tutors?search=${encodeURIComponent(query.trim())}`);
    }
  };

  // Build a flat array of currently visible options for keyboard navigation
  const getNavigableItems = () => {
    const items: { text: string; type: string; id?: string }[] = [];
    if (!query.trim()) {
      recentSearches.forEach((s) => items.push({ text: s.text, type: s.type, id: s.id }));
      trendingSearches.forEach((s) => items.push({ text: s, type: "trending" }));
    } else if (results) {
      results.subjects.forEach((s) => items.push({ text: s.name, type: "subject", id: s.id }));
      results.tutors.forEach((t) => items.push({ text: t.name, type: "tutor", id: t.id }));
      results.categories.forEach((c) => items.push({ text: c.name, type: "category", id: c.id }));
    }
    return items;
  };

  const navigableItems = getNavigableItems();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isFocused) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < navigableItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : navigableItems.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < navigableItems.length) {
        const selected = navigableItems[activeIndex];
        handleSelect(selected.text, selected.type, selected.id);
      } else {
        handleSearchSubmit(e);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsFocused(false);
    }
  };

  // Helper to check if current item is active
  const isItemActive = (text: string) => {
    if (activeIndex === -1) return false;
    return navigableItems[activeIndex]?.text === text;
  };

  const showDropdown = isFocused;
  const hasResults =
    results &&
    (results.subjects.length > 0 ||
      results.tutors.length > 0 ||
      results.categories.length > 0);
  const showEmptyState = !isLoading && query.trim() !== "" && results && !hasResults;

  return (
    <div ref={containerRef} className="w-full relative z-50">
      <form
        onSubmit={handleSearchSubmit}
        className={`w-full flex items-center gap-2 bg-card dark:bg-card/60 dark:backdrop-blur-xl rounded-2xl p-2 shadow-lg transition-all border border-border/50 dark:border-white/10 ${
          isFocused ? "ring-2 ring-primary/50 shadow-xl" : "dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
        }`}
      >
        <Search className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground ml-1 sm:ml-3 mr-1 sm:mr-2 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="What do you want to learn today? (e.g. Business, Mathematics)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsFocused(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground px-1 sm:px-2 h-11 sm:h-12 text-sm sm:text-base truncate"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="search-dropdown"
          aria-activedescendant={activeIndex >= 0 ? `search-item-${activeIndex}` : undefined}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors mr-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <button
          type="submit"
          className="bg-primary hover:bg-primary-dark text-white font-medium rounded-xl px-4 sm:px-8 h-11 sm:h-12 text-sm sm:text-base shadow-md transition-all shrink-0"
        >
          Search
        </button>
      </form>

      {/* DROPDOWN */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            id="search-dropdown"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-3 bg-card dark:bg-card/90 dark:backdrop-blur-2xl border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] sm:max-h-[500px]"
          >
            <div className="overflow-y-auto overscroll-contain flex-1 py-2">
              
              {/* LOADING STATE */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                  <span className="text-sm font-medium">Searching our network...</span>
                </div>
              )}

              {/* EMPTY STATE */}
              {showEmptyState && (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">No results found</h3>
                  <p className="text-sm text-muted-foreground max-w-[250px]">
                    We couldn't find any matches for "{query}". Try checking for typos or using different keywords.
                  </p>
                </div>
              )}

              {/* IDLE STATE (Empty Query) */}
              {!query.trim() && !isLoading && (
                <div className="px-2">
                  {recentSearches.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <span>Recent Searches</span>
                        <button
                          onClick={clearAllRecent}
                          className="hover:text-foreground transition-colors hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                      <ul>
                        {recentSearches.map((search) => {
                          const active = isItemActive(search.text);
                          return (
                            <li key={`recent-${search.text}`}>
                              <button
                                onClick={() => handleSelect(search.text, search.type, search.id)}
                                className={`group/recent w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors text-left ${
                                  active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {search.type === "tutor" ? <User className="w-4 h-4" /> : search.type === "subject" || search.type === "category" ? <Tag className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                  <span className="font-medium">{search.text}</span>
                                </div>
                                <X
                                  className="w-4 h-4 opacity-0 hover:opacity-100 group-hover/recent:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                  onClick={(e) => removeRecentSearch(e, search.text)}
                                />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  <div>
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Trending Searches</span>
                      </div>
                    </div>
                    <ul>
                      {trendingSearches.map((search) => {
                        const active = isItemActive(search);
                        return (
                          <li key={`trending-${search}`}>
                            <button
                              onClick={() => handleSelect(search, "trending")}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                                active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                              }`}
                            >
                              <Search className="w-4 h-4" />
                              <span className="font-medium">{search}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}

              {/* SEARCH RESULTS */}
              {hasResults && !isLoading && (
                <div className="px-2 space-y-4">
                  
                  {/* Subjects */}
                  {results.subjects.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5" /> Subjects
                      </div>
                      <ul>
                        {results.subjects.map((item) => {
                          const active = isItemActive(item.name);
                          return (
                            <li key={`subject-${item.id}`}>
                              <button
                                onClick={() => handleSelect(item.name, "subject", item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                                  active ? "bg-primary/10 dark:bg-primary/20" : "hover:bg-muted/50"
                                }`}
                              >
                                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                  <BookOpen className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-foreground">
                                  <HighlightedText text={item.name} highlight={query} />
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Tutors */}
                  {results.tutors.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-semibold text-secondary uppercase tracking-wider flex items-center gap-2">
                        <User className="w-3.5 h-3.5" /> Tutors
                      </div>
                      <ul>
                        {results.tutors.map((item) => {
                          const active = isItemActive(item.name);
                          return (
                            <li key={`tutor-${item.id}`}>
                              <button
                                onClick={() => handleSelect(item.name, "tutor", item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                                  active ? "bg-secondary/10 dark:bg-secondary/20" : "hover:bg-muted/50"
                                }`}
                              >
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-8 h-8 rounded-full object-cover shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="flex flex-col">
                                  <span className="font-medium text-foreground leading-tight">
                                    <HighlightedText text={item.name} highlight={query} />
                                  </span>
                                  {item.rating && (
                                    <span className="text-xs text-amber-500 font-medium">★ {item.rating.toFixed(1)}</span>
                                  )}
                                </div>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Categories */}
                  {results.categories.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5" /> Categories
                      </div>
                      <ul>
                        {results.categories.map((item) => {
                          const active = isItemActive(item.name);
                          return (
                            <li key={`category-${item.id}`}>
                              <button
                                onClick={() => handleSelect(item.name, "category", item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                                  active ? "bg-accent/10 dark:bg-accent/20" : "hover:bg-muted/50"
                                }`}
                              >
                                <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                                  <Tag className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-foreground">
                                  <HighlightedText text={item.name} highlight={query} />
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* FOOTER */}
            {hasResults && (
              <div className="p-3 border-t border-border bg-muted/20 dark:bg-muted/10">
                <button
                  onClick={handleSearchSubmit}
                  className="w-full py-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors text-center"
                >
                  See all results for "{query}" &rarr;
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
