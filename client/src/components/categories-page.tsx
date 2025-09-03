import { useEffect, useState } from "react";
import api from "../lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AddCategoryModal } from "../components/add-category-modal";
import { EditCategoryModal } from "../components/edit-category-modal";
import { Search, Plus, Edit, Trash2, Layers, FolderOpen } from "lucide-react";
import { ConfirmDialog } from "./confirmDelete ";
import toast, { Toaster } from "react-hot-toast";
import { Skeleton } from "./ui/skeleton";

interface Category {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  count: number;
}

export function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/api/categories");
      const categoriesWithId = response.data.map((cat: any) => ({
        ...cat,
        id: cat._id || cat.id,
      }));
      setCategories(categoriesWithId);
    } catch (err: any) {
      console.error(err);
      setError("Error fetching categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleCategoryAdded = async (_newCategory: Category) => {
    await fetchCategories();
    setIsAddModalOpen(false);
    toast.success("Category added successfully!");
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      await api.delete(`/api/categories/${categoryToDelete}`);
      setCategories((prev) =>
        prev.filter((cat) => cat.id !== categoryToDelete)
      );
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      toast.success("Category deleted successfully!");
    } catch (error) {
      toast.error("Error category deleted");
    }
  };

  const handleEditClick = (category: Category) => {
    setCategoryToEdit(category);
    setIsEditModalOpen(true);
  };

  const handleCategoryUpdated = (updatedCategory: Category) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat))
    );
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
    
  };

  const filteredCategories = categories.filter(
    (category) =>
      category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category?.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">
            Organize your portfolio projects by category
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
        />
      </div>

      {/* Loader / Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="border-0 shadow-md bg-white rounded-xl p-4 space-y-4"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-md" /> {/* fake icon */}
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" /> {/* title */}
                  <Skeleton className="h-3 w-48" /> {/* description */}
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-md" /> {/* badge */}
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Card
              key={category.id}
              className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{category.icon}</div>
                    <div className="flex-1 w-full">
                      <CardTitle className="text-lg text-gray-900">
                        {category.name}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1 break-all whitespace-normal">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditClick(category)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteClick(category.id)}
                      className="h-8 w-8 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <Badge className={category.color}>
                    {category.count ?? 0}{" "}
                    {category.count === 1 ? "project" : "projects"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Layers className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No categories found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? "Try adjusting your search criteria"
              : "Get started by creating your first category"}
          </p>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      )}

      <AddCategoryModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onCategoryAdded={handleCategoryAdded}
      />

      <EditCategoryModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        category={categoryToEdit}
        onCategoryUpdated={handleCategoryUpdated}
      />

      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Category"
        description="Are you sure you want to delete this category?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
