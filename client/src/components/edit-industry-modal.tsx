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
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: industry?.name || "",
    },
    validationSchema: industryValidationSchema,
    validateOnBlur: false,
    onSubmit: async (values) => {
      if (!industry) return;

      try {
        await api.put(`/api/industry/${industry._id}`, {
          name: values.name,
        });

        onOpenChange(false);

        if (onIndustryUpdated) {
          onIndustryUpdated();
        }
        toast.success("Industry updated successfully!");
      } catch (error: any) {
        console.error("Industry update error:", error);
        const errorMessage =
          error.response?.data?.error ||
          error.message ||
          "Failed to update industry";
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
              {formik.isSubmitting ? "Updating..." : "Update Industry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
