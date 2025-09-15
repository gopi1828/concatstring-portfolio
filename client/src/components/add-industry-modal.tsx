import { useEffect } from "react";
import { useFormik } from "formik";
import { industryValidationSchema } from "../lib/industryValidation";
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

interface AddIndustryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndustryAdded?: () => void;
}

export function AddIndustryModal({
  open,
  onOpenChange,
  onIndustryAdded,
}: AddIndustryModalProps) {
  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema: industryValidationSchema,
    validateOnBlur: false,
    onSubmit: async (values) => {
      try {
        await api.post("/api/industry", {
          name: values.name,
        });

        formik.resetForm();
        onOpenChange(false);

        // Refresh the industries list
        if (onIndustryAdded) {
          onIndustryAdded();
        }
        toast.success("Industry added successfully!");
      } catch (error: any) {
        console.error("Industry add error:", error);
        const errorMessage =
          error.response?.data?.error ||
          error.message ||
          "Failed to add industry";
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add New Industry
          </DialogTitle>
          <DialogDescription>
            Add a new industry to categorize your portfolio projects.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Industry Name *
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., E-commerce, Finance, Healthcare"
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
              {formik.isSubmitting ? "Adding..." : "Add Industry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}