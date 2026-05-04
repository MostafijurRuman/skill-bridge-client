import { BookOpen, FolderTree } from "lucide-react";
import { getAdminCategories } from "@/services/admin";

export default async function AdminCategoriesPage() {
  const categoriesResult = await getAdminCategories();
  const categories = categoriesResult.data || [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-primary">Categories</h1>
        <p className="text-muted-foreground mt-1 font-sans">Manage tutoring subject categories.</p>
      </div>

      {!categoriesResult.success && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-2xl border border-destructive/20 font-medium text-sm">
          {categoriesResult.message || "Failed to load categories."}
        </div>
      )}

      <div className="grid auto-rows-min gap-4 sm:grid-cols-2">
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4 transition-all hover:border-blue-500/30 group">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total categories</p>
            <p className="font-bold text-foreground font-heading text-xl">{categories.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border shadow-sm p-6 sm:p-8 relative overflow-hidden dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)]">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
        
        {categories.length === 0 ? (
          <div className="text-center py-10 relative z-10 bg-muted/20 rounded-2xl border border-dashed border-border">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground font-medium">No categories found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
            {categories.map((category) => (
              <div
                key={category.id}
                className="rounded-2xl border border-border bg-muted/30 p-5 flex items-center justify-between gap-4 transition-all hover:bg-muted/50 hover:border-primary/30 group"
              >
                <div>
                  <p className="font-bold text-foreground group-hover:text-primary transition-colors">{category.name}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1 opacity-70">{category.id}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-background border border-border shadow-sm flex items-center justify-center shrink-0 group-hover:border-primary/30 transition-colors">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
