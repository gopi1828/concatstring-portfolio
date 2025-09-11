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

interface EditIndustryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndustryUpdated?: () => void;
  industry: {
    _id: string;
    name: string;
  } | null;
}

export function EditIndustryModal({
  open,
  onOpenChange,
  onIndustryUpdated,
  industry,
}: EditIndustryModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens or industry changes
  useEffect(() => {
    if (open && industry) {
      setName(industry.name);
    } else if (!open) {
      setName("");
    }
  }, [open, industry]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!industry) return;
    
    setLoading(true);

    try {
      await api.put(`/api/industry/${industry._id}`, {
        name,
      });

      onOpenChange(false);

      // Refresh the industries list
      if (onIndustryUpdated) {
        onIndustryUpdated();
      }
      toast.success("Industry updated successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update industry";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(industry?.name || "");
    onOpenChange(false);
  };

  if (!industry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Industry
          </DialogTitle>
          <DialogDescription>
            Update the industry name for "{industry.name}".
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Industry Name *
            </Label>
            <Input
              id="name"
              placeholder="e.g., E-commerce, Finance, Healthcare"
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
              {loading ? "Updating..." : "Update Industry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
