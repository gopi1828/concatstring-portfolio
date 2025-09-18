import { useFormik } from "formik";
import { useEffect } from "react";
import { tagValidationSchema } from "../lib/tagValidation";
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
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: tag?.name || "",
    },
    validationSchema: tagValidationSchema,
    validateOnBlur: false,
    onSubmit: async (values) => {
      if (!tag) return;

      try {
        await api.put(`/api/tags/${tag._id}`, {
          name: values.name,
        });

        onOpenChange(false);

        if (onTagUpdated) {
          onTagUpdated();
        }
        toast.success("Tag updated successfully!");
      } catch (error: any) {
        console.error("Tag update error:", error);

        const errorMessage = error.message || "Failed to update tag";
        toast.error(errorMessage);
      }
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm();
    }
  }, [open]);

  const handleCancel = () => {
    formik.resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Tag</DialogTitle>
          <DialogDescription>
            Update the tag name to better categorize your portfolio projects.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Tag Name *
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., React, Frontend, E-commerce"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-red-600">{formik.errors.name}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={formik.isSubmitting}
              className="border-gray-200 hover:bg-gray-50 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formik.isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {formik.isSubmitting ? "Updating..." : "Update Tag"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
