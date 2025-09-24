import { useState, useEffect } from "react";
import { useFormik } from "formik";
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
import { toast } from "react-hot-toast";
import api from "../lib/api";

interface AddPageBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPageBuilderAdded?: () => void;
}

export function AddPageBuilderModal({
  open,
  onOpenChange,
  onPageBuilderAdded,
}: AddPageBuilderModalProps) {
  const [isClientSide, setIsClientSide] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClientSide(true);
  }, []);

  const initialValues = {
    name: "",
  };

  const formik = useFormik({
    initialValues,
    validate: (values) => {
      const errors: any = {};
      if (!values.name || values.name.trim() === "") {
        errors.name = "Name is required";
      }
      return errors;
    },
    validateOnBlur: false,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const response = await api.post("/api/pagebuilders", {
          name: values.name.trim(),
        });

        if (response.status === 201 || response.status === 200) {
          toast.success("Page Builder added successfully!");
          formik.resetForm();
          onOpenChange(false);
          if (onPageBuilderAdded) onPageBuilderAdded();
        }
      } catch (err: any) {
        const message =
          err?.response?.data?.error || "Failed to add page builder.";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleCancel = () => {
    formik.resetForm();
    onOpenChange(false);
  };

  if (!isClientSide) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          formik.resetForm();
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add Page Builder
          </DialogTitle>
          <DialogDescription>
            Create a new page builder to categorize your projects.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name *
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter page builder name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            />
            {formik.touched.name && formik.errors.name && (
              <span className="text-sm text-red-600">
                {formik.errors.name}
              </span>
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
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {isLoading ? "Adding..." : "Add Page Builder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
