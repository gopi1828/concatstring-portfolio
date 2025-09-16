import { useFormik } from "formik";
import { useEffect } from "react";
import { categoryValidationSchema } from "../lib/categoryValidation";
import api from "../lib/api";
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

interface Category {
  id: string;
  name: string;
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
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: category?.name || "",
    },
    validationSchema: categoryValidationSchema,
    validateOnBlur: false,
    onSubmit: async (values) => {
      if (!category) return;

      try {
        await api.put(`/api/categories/${category.id}`, {
          name: values.name,
        });

        // Update the category in the parent component
        const updatedCategory = {
          ...category,
          name: values.name,
        };
        onCategoryUpdated(updatedCategory);
        onOpenChange(false);
        toast.success("Category updated successfully!");
      } catch (error: any) {
        const errorMessage = 
          error.response?.data?.message || 
          error.message || 
          "Error updating category";
        toast.error(errorMessage);
      }
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      formik.resetForm();
    }
  }, [open]);

  const handleCancel = () => {
    formik.resetForm();
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

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Category Name *
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter category name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-red-600">
                {formik.errors.name}
              </p>
            )}
          </div>

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
              disabled={formik.isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {formik.isSubmitting ? "Updating..." : "Update Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
