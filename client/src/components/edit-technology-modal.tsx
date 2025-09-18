import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { technologyValidationSchema } from "../lib/technologyValidation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import toast from "react-hot-toast";
import api from "../lib/api";

interface Technology {
  _id: string;
  name: string;
  category: string;
}

interface EditTechnologyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTechnologyUpdated?: () => void;
  technology: Technology | null;
}

export function EditTechnologyModal({
  open,
  onOpenChange,
  onTechnologyUpdated,
  technology,
}: EditTechnologyModalProps) {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      formik.resetForm();
    }
  }, [open]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: technology?.name || "",
      category: technology?.category || "",
    },
    validationSchema: technologyValidationSchema,
    validateOnBlur: false,
    onSubmit: async (values) => {
      if (!technology) return;

      setIsSubmitting(true);
      try {
        await api.put(`/api/technologies/${technology._id}`, {
          name: values.name,
          category: values.category,
        });

        onOpenChange(false);

        if (onTechnologyUpdated) {
          onTechnologyUpdated();
        }
        toast.success("Technology updated successfully!");
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to update technology";
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await api.get("/api/categories");

      const data = response.data.map((cat: any) => ({
        id: cat._id,
        name: cat.name,
      }));

      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCancel = () => {
    formik.resetForm();
    onOpenChange(false);
  };

  if (!technology) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Technology
          </DialogTitle>
          <DialogDescription>
            Update the details for "{technology.name}".
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Technology Name *
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., React, Node.js, PostgreSQL"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isSubmitting}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-red-600">{formik.errors.name}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category *</Label>
            <Select
              value={formik.values.category}
              onValueChange={(value) => formik.setFieldValue("category", value)}
              disabled={isSubmitting || loadingCategories}
            >
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {loadingCategories ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : categories.length > 0 ? (
                  categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="empty" disabled>
                    No categories available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {formik.touched.category && formik.errors.category && (
              <p className="text-sm text-red-600">{formik.errors.category}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="border-gray-200 hover:bg-gray-50 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {isSubmitting ? "Updating..." : "Update Technology"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
