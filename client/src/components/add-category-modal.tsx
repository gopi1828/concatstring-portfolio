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
  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema: categoryValidationSchema,
    validateOnBlur: false,
    onSubmit: async (values) => {
      try {
        const response = await api.post("/api/categories", {
          name: values.name,
        });
        const created = response.data?.category || response.data;

        onCategoryAdded({
          ...created,
          id: created._id || created.id,
          count: 0,
        });
        
        formik.resetForm();
        onOpenChange(false);
      } catch (error: any) {
        const errorMessage = 
          error.response?.data?.message || 
          error.message || 
          "Error adding category";
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add New Category
          </DialogTitle>
          <DialogDescription>
            Create a new category to organize your portfolio projects.
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
              {formik.isSubmitting ? "Adding..." : "Add Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
