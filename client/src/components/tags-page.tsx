import { useEffect, useState } from "react";
import api from "../lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Search, Plus, Edit, Trash2, Tag } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import toast from "react-hot-toast";
import { ConfirmDialog } from "./ui/confirm-delete";
import { Skeleton } from "./ui/skeleton";
import { AddTagModal } from "./add-tag-modal";
import { EditTagModal } from "./edit-tag-modal";

type TagType = {
  _id: string;
  name: string;
  count: number;
};

export function TagsPage() {
  const [tags, setTags] = useState<TagType[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [tagToDelete, setTagToDelete] = useState<TagType | null>(null);
  const [tagToEdit, setTagToEdit] = useState<TagType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/tags");
      setTags(res.data);
    } catch (error) {
      toast.error("Error fetching tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleTagAdded = () => {
    fetchTags();
  };

  const handleTagUpdated = () => {
    fetchTags();
  };

  const handleEditClick = (tag: TagType) => {
    setTagToEdit(tag);
    setIsEditModalOpen(true);
  };

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
          <p className="text-gray-600">Manage your portfolio tags</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Tag
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
        />
      </div>

      {/* Loader / Tags Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4 border-0 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTags.map((tag) => (
              <Card
                key={tag._id}
                className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="text-2xl flex-shrink-0">🏷️</div>
                      <div className="flex-1 min-w-0">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <CardTitle className="text-lg text-gray-900 break-words leading-tight cursor-help">
                                {tag.name}
                              </CardTitle>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs break-words">
                                {tag.name}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-accent"
                        onClick={() => handleEditClick(tag)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-accent"
                        onClick={() => setTagToDelete(tag)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                <Badge className="bg-blue-100 text-blue-800">
                    {tag.count ?? 0}{" "}
                    {tag.count === 1 ? "project" : "projects"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredTags.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Tag className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tags found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "Get started by creating your first tag"}
              </p>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={!!tagToDelete}
        title="Delete Tag"
        description={`Are you sure you want to delete "${tagToDelete?.name}"?`}
        onCancel={() => setTagToDelete(null)}
        onConfirm={async () => {
          if (!tagToDelete) return;
          try {
            await api.delete(`/api/tags/${tagToDelete._id}`);
            toast.success("Deleted successfully");
            fetchTags();
          } catch (error) {
            toast.error("Failed to delete");
          } finally {
            setTagToDelete(null);
          }
        }}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Add Tag Modal */}
      <AddTagModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onTagAdded={handleTagAdded}
      />

      {/* Edit Tag Modal */}
      <EditTagModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onTagUpdated={handleTagUpdated}
        tag={tagToEdit}
      />
    </div>
  );
}
