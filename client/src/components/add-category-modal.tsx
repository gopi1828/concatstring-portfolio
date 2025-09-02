"use client";

import type React from "react";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryIcons, colorOptions } from "@/lib/category-config";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  count: number;
}

interface AddCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryAdded: (category: Category) => void;
}

export function AddCategoryModal({
  open,
  onOpenChange,
  onCategoryAdded,
}: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/category", {
        name,
        description,
        icon,
        color,
      });
      const created = response.data?.category || response.data;

      onCategoryAdded({
        ...created,
        id: created._id || created.id,
        count: 0,
      });
      //reset form
      setName("");
      setDescription("");
      setIcon("");
      setColor("");
      onOpenChange(false);
    } catch (error) {
      toast.error("Error adding category");
      // console.error("Error adding category", error)
    }
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    setIcon("");
    setColor("");
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* <Toaster position="top-right"/> */}
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add New Category
          </DialogTitle>
          <DialogDescription>
            Create a new category to organize your portfolio projects.
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
                {categoryIcons.map((iconOption) => (
                  <SelectItem key={iconOption.id} value={iconOption.value}>
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
                      0 projects
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Add Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
