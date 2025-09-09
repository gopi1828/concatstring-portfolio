import type { FormEvent } from "react";
import { useState, useEffect } from "react";
import api from "../lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { categoryIcons, colorOptions } from "../lib/category-config";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  count: number;
}

interface EditCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onCategoryUpdated: (updatedCategory: Category) => void;
}

export function EditCategoryModal({
  open,
  onOpenChange,
  category,
  onCategoryUpdated,
}: EditCategoryModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("");
  const [loading, setLoading] = useState(false);

  // Populate form when category changes
  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || "");
      setIcon(category.icon);
      setColor(category.color);
    }
  }, [category]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!category) return;

    setLoading(true);
    try {
      await api.put(`/api/categories/${category.id}`, {
        name,
        description,
        icon,
        color,
      });

      // Update the category in the parent component
      const updatedCategory = {
        ...category,
        name,
        description,
        icon,
        color,
      };
      onCategoryUpdated(updatedCategory);
      onOpenChange(false);
      toast.success("Category updated successfuly!");
    } catch (error) {
      toast.error("Error updating category");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (category) {
      setName(category.name);
      setDescription(category.description || "");
      setIcon(category.icon);
      setColor(category.color);
    }
    onOpenChange(false);
  };

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Category
          </DialogTitle>
          <DialogDescription>
            Update the details of your category.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Category Name *
            </Label>
            <Input
              id="name"
              placeholder="Enter category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe this category..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Icon</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                {categoryIcons.map((iconOption, index) => (
                  <SelectItem
                    key={`${iconOption.value}-${index}`}
                    value={iconOption.value}
                  >
                    {iconOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Color Theme</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                <SelectValue placeholder="Select a color" />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((colorOption) => (
                  <SelectItem key={colorOption.value} value={colorOption.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded ${colorOption.preview}`}
                      ></div>
                      {colorOption.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {(name || icon || color) && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview</Label>
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{icon || "📁"}</div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {name || "Category Name"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {description || "Category description"}
                    </p>
                  </div>
                </div>
                {color && (
                  <div className="mt-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${color}`}
                    >
                      {category.count}{" "}
                      {category.count === 1 ? "project" : "projects"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="border-gray-200 hover:bg-gray-50 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {loading ? "Updating..." : "Update Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
