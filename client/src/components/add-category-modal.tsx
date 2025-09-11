import { useFormik } from "formik";
import { useEffect } from "react";
import { categoryValidationSchema } from "../lib/categoryValidation";
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
import { categoryIcons } from "../lib/category-config";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  description?: string;
  icon: string;
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
      description: "",
      icon: "",
    },
    validationSchema: categoryValidationSchema,
    validateOnBlur: false,
    onSubmit: async (values) => {
      try {
        const response = await api.post("/api/categories", {
          name: values.name,
          description: values.description,
          icon: values.icon,
        });
        const created = response.data?.category || response.data;

        onCategoryAdded({
          ...created,
          id: created._id || created.id,
          count: 0,
        });
        
        formik.resetForm();
        onOpenChange(false);
      } catch (error) {
        toast.error("Error adding category");
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe this category..."
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={3}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-sm text-red-600">
                {formik.errors.description}
              </p>
            )}
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Icon *</Label>
            <Select 
              value={formik.values.icon} 
              onValueChange={(value) => formik.setFieldValue("icon", value)}
            >
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
            {formik.touched.icon && formik.errors.icon && (
              <p className="text-sm text-red-600">
                {formik.errors.icon}
              </p>
            )}
          </div>

          {/* Preview */}
          {(formik.values.name || formik.values.icon) && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview</Label>
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{formik.values.icon || "📁"}</div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {formik.values.name || "Category Name"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formik.values.description || "Category description"}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    0 projects
                  </span>
                </div>
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
