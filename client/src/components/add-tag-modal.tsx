import type { FormEvent } from "react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import toast from "react-hot-toast";
import api from "../lib/api";

interface AddTagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTagAdded?: () => void;
}

export function AddTagModal({
  open,
  onOpenChange,
  onTagAdded,
}: AddTagModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setName("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/api/tags", {
        name,
      });

      resetForm();
      onOpenChange(false);

      // Refresh the tags list
      if (onTagAdded) {
        onTagAdded();
      }
      toast.success("Tag added successfully!");
    } catch (error: any) {
      console.error("Tag add error:", error);
      const errorMessage = 
        error.response?.data?.error || 
        error.message || 
        "Failed to add tag";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add New Tag
          </DialogTitle>
          <DialogDescription>
            Create a new tag to categorize your portfolio projects.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Tag Name *
            </Label>
            <Input
              id="name"
              placeholder="e.g., React, Frontend, E-commerce"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="border-gray-200 hover:bg-gray-50 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {loading ? "Adding..." : "Add Tag"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}