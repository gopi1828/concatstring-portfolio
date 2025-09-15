import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { technologyValidationSchema } from "../lib/technologyValidation";
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
import toast from "react-hot-toast";
import api from "../lib/api";

interface Technology {
  _id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
}

interface EditTechnologyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTechnologyUpdated?: () => void;
  technology: Technology | null;
}



const techIcons = [
  { value: "⚛️", label: "React (⚛️)" },
  { value: "▲", label: "Next.js (▲)" },
  { value: "🔷", label: "TypeScript (🔷)" },
  { value: "🎨", label: "CSS/Design (🎨)" },
  { value: "🟢", label: "Node.js (🟢)" },
  { value: "🐍", label: "Python (🐍)" },
  { value: "☕", label: "Java (☕)" },
  { value: "🐘", label: "PostgreSQL (🐘)" },
  { value: "🍃", label: "MongoDB (🍃)" },
  { value: "🐳", label: "Docker (🐳)" },
  { value: "☁️", label: "Cloud (☁️)" },
  { value: "🔧", label: "Tools (🔧)" },
  { value: "📱", label: "Mobile (📱)" },
  { value: "🎮", label: "Games (🎮)" },
  { value: "🤖", label: "AI/ML (🤖)" },
  { value: "⚡", label: "Performance (⚡)" },
];


export function EditTechnologyModal({
  open,
  onOpenChange,
  onTechnologyUpdated,
  technology,
}: EditTechnologyModalProps) {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      formik.resetForm();
    }
  }, [open]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: technology?.name || "",
      description: technology?.description || "",
      category: technology?.category || "",
      icon: technology?.icon || "",
    },
    validationSchema: technologyValidationSchema,
    validateOnBlur: false,
    onSubmit: async (values) => {
      if (!technology) return;
      
      setIsSubmitting(true);
      try {
        await api.put(`/api/technologies/${technology._id}`, {
          name: values.name,
          description: values.description,
          category: values.category,
          icon: values.icon,
        });

        onOpenChange(false);

        // Refresh the technologies list
        if (onTechnologyUpdated) {
          onTechnologyUpdated();
        }
        toast.success("Technology updated successfully!");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update technology";
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await api.get("/api/categories");
      const data = response.data.map((cat: any) => ({
        id: cat._id || cat.id,
        name: cat.name,
      }));
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
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
              required
              disabled={isSubmitting}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-red-600">{formik.errors.name}</p>
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
              placeholder="Brief description of the technology..."
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={3}
              disabled={isSubmitting}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-sm text-red-600">{formik.errors.description}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category *</Label>
            <Select
              value={formik.values.category}
              onValueChange={(value) => formik.setFieldValue("category", value)}
              required
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

          {/* Icon */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Icon *</Label>
            <Select 
              value={formik.values.icon} 
              onValueChange={(value) => formik.setFieldValue("icon", value)}
              required
              disabled={isSubmitting}
            >
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                <SelectValue placeholder="Select icon" />
              </SelectTrigger>
              <SelectContent>
                {techIcons.map((iconOption) => (
                  <SelectItem key={iconOption.value} value={iconOption.value}>
                    {iconOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.icon && formik.errors.icon && (
              <p className="text-sm text-red-600">{formik.errors.icon}</p>
            )}
          </div>

          {/* Preview */}
          {(formik.values.name || formik.values.icon || formik.values.category) && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview</Label>
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-2xl flex-shrink-0">{formik.values.icon || "🔧"}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 break-words leading-tight">
                      {formik.values.name || "Technology Name"}
                    </h3>
                    <p className="text-sm text-gray-500 break-words">
                      {getCategoryName(formik.values.category) || "Category"}
                    </p>
                  </div>
                </div>
                {formik.values.description && (
                  <p className="text-sm text-gray-600 mb-3">{formik.values.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
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
