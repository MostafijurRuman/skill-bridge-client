import { BookOpen, FolderTree } from "lucide-react";
import { getAdminCategories } from "@/services/admin";

export default async function AdminCategoriesPage() {
  const categoriesResult = await getAdminCategories();
  const categories = categoriesResult.data || [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-primary">Categories</h1>
        <p className="text-muted-foreground mt-1">Manage tutoring subject categories.</p>
      </div>

      {!categoriesResult.success && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
          {categoriesResult.message || "Failed to load categories."}
        </div>
      )}

      <div className="grid auto-rows-min gap-4 sm:grid-cols-2">
        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total categories</p>
            <p className="font-semibold text-slate-900">{categories.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-10 h-10 mx-auto text-slate-400" />
            <p className="text-muted-foreground mt-3">No categories found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="rounded-xl border border-border bg-slate-50 p-4 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-slate-900">{category.name}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{category.id}</p>
                </div>
                <BookOpen className="w-4 h-4 text-primary shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
