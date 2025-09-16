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

interface AddTechnologyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTechnologyAdded?: () => void;
}



export function AddTechnologyModal({
  open,
  onOpenChange,
  onTechnologyAdded,
}: AddTechnologyModalProps) {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await api.get("/api/categories");
        const mapped = res.data.map((cat: any) => ({
          id: cat._id || cat.id,
          name: cat.name,
        }));
        setCategories(mapped);
      } catch (err) {
        toast.error("Failed to fetch categories");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: "",
      category: "",
    },
    validationSchema: technologyValidationSchema,
    validateOnBlur: false,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        await api.post("/api/technologies", {
          name: values.name,
          category: values.category,
        });

        formik.resetForm();
        onOpenChange(false);

        // Refresh the technologies list
        if (onTechnologyAdded) {
          onTechnologyAdded();
        }
        toast.success("Technology added successfully!");
      } catch (error: any) {
        const errorMessage = 
          error.response?.data?.message || 
          error.message || 
          "Failed to add technology";
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add New Technology
          </DialogTitle>
          <DialogDescription>
            Add a new technology to your portfolio tech stack.
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
              {isSubmitting ? "Adding..." : "Add Technology"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
