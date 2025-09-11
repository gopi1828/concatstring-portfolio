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

interface EditTagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTagUpdated?: () => void;
  tag: {
    _id: string;
    name: string;
  } | null;
}

export function EditTagModal({
  open,
  onOpenChange,
  onTagUpdated,
  tag,
}: EditTagModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens or tag changes
  useEffect(() => {
    if (open && tag) {
      setName(tag.name);
    } else if (!open) {
      setName("");
    }
  }, [open, tag]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!tag) return;
    
    setLoading(true);

    try {
      await api.put(`/api/tags/${tag._id}`, {
        name,
      });

      onOpenChange(false);

      // Refresh the tags list
      if (onTagUpdated) {
        onTagUpdated();
      }
      toast.success("Tag updated successfully!");
    } catch (error: any) {
      console.error("Tag update error:", error);
      const errorMessage = 
        error.response?.data?.error || 
        error.message || 
        "Failed to update tag";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(tag?.name || "");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Tag
          </DialogTitle>
          <DialogDescription>
            Update the tag name to better categorize your portfolio projects.
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
              {loading ? "Updating..." : "Update Tag"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
