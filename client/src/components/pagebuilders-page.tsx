import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AddPageBuilderModal } from "./add-pagebuilder-modal";
import { EditPageBuilderModal } from "./edit-pagebuilder-modal";
import { ConfirmDialog } from "./ui/confirm-delete";
import { Search, Plus, Edit, Trash2, Layout } from "lucide-react";
import toast from "react-hot-toast";
import { Skeleton } from "./ui/skeleton";
import api from "../lib/api";

interface PageBuilder {
  _id: string;
  name: string;
  count?: number;
}

export function PageBuildersPage() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pageBuilderToEdit, setPageBuilderToEdit] = useState<PageBuilder | null>(
    null
  );
  const [pageBuilders, setPageBuilders] = useState<PageBuilder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pageBuilderToDelete, setPageBuilderToDelete] =
    useState<PageBuilder | null>(null);

  const fetchPageBuilders = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/pagebuilders");
      const data: PageBuilder[] = response.data;

      const cleaned = data.filter(
        (pageBuilder) => typeof pageBuilder.name === "string"
      );

      setPageBuilders(cleaned);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error fetching page builders";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageBuilders();
  }, []);

  const handleEditPageBuilder = (pageBuilder: PageBuilder) => {
    setPageBuilderToEdit(pageBuilder);
    setIsEditModalOpen(true);
  };

  const handleDeletePageBuilder = async () => {
    if (!pageBuilderToDelete) return;
    setDeleteLoading(true);
    try {
      const response = await api.delete(
        `/api/pagebuilders/${pageBuilderToDelete._id}`
      );

      const result = response.data;
      if (result?.success === false) {
        throw new Error(result.message || "Failed to delete page builder");
      }

      await fetchPageBuilders();
      toast.success("Page Builder deleted successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete page builder";
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(false);
      setPageBuilderToDelete(null);
    }
  };

  const filteredPageBuilders = pageBuilders.filter((pageBuilder) => {
    const name = (pageBuilder.name || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    return name.includes(search);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Page Builders</h1>
          <p className="text-gray-600">
            Manage page builders used in your projects
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Page Builder
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search page builders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-black"
          />
        </div>
      </div>

      {/* Loader  */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card
              key={i}
              className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-5 w-32 mb-2" />{" "}
                      {/* page builder name */}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-20 rounded-md" />{" "}
                  {/* projects badge */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && <div className="text-center py-12 text-red-500">{error}</div>}

      {/* Page Builders Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPageBuilders.map((pageBuilder) => (
            <Card
              key={pageBuilder._id || pageBuilder.name}
              className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg text-gray-900 break-words leading-tight">
                        {pageBuilder.name || "Unnamed"}
                      </CardTitle>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 hover:bg-accent"
                      onClick={() => handleEditPageBuilder(pageBuilder)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 hover:bg-accent"
                      onClick={() => setPageBuilderToDelete(pageBuilder)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-600 hover:text-white transition-colors duration-200">
                    {pageBuilder.count ?? 0}{" "}
                    {pageBuilder.count === 1 ? "project" : "projects"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && filteredPageBuilders.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Layout className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No page builders found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? "Try adjusting your search criteria"
              : "Get started by adding your first page builder"}
          </p>
    
        </div>
      )}

      <AddPageBuilderModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onPageBuilderAdded={fetchPageBuilders}
      />

      <EditPageBuilderModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onPageBuilderUpdated={fetchPageBuilders}
        pageBuilder={pageBuilderToEdit}
      />

      <ConfirmDialog
        isOpen={!!pageBuilderToDelete}
        title="Delete Page Builder"
        description={`Are you sure you want to delete "${pageBuilderToDelete?.name}"?`}
        confirmText={deleteLoading ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={handleDeletePageBuilder}
        onCancel={() => setPageBuilderToDelete(null)}
      />
    </div>
  );
}
