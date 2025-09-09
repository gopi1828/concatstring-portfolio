import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { portfolioValidationSchema } from "../lib/portfolioValidation";
import api from "../lib/api";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Upload, X, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EditPortfolioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: any;
  portfolioId: string;
  onUpdated?: () => void;
}

export default function EditPortfolioModal({
  open,
  onOpenChange,
  initialValues,
  portfolioId,
  onUpdated,
}: EditPortfolioModalProps) {
  const [isClientSide, setIsClientSide] = useState(false);
  const [techOptions, setTechOptions] = useState<any[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [tagOptions, setTagOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialValues?.tag || []
  );
  const [newTag, setNewTag] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();

  const isImageUrl = (url: string) => {
    const clean = (url || "").split("?")[0].toLowerCase();
    // Treat everything except explicit PDFs as images, since we only accept images or PDFs
    return !clean.endsWith(".pdf");
  };
  const extractFileNameFromUrl = (url: string) => url.split("/").pop() || url;
  const setPreviewFromUploads = (uploads: Array<File | string>) => {
    for (const item of uploads) {
      if (typeof item === "string") {
        if (isImageUrl(item)) {
          setImagePreview(item);
          return;
        }
      } else if (item && (item as File).type?.startsWith("image/")) {
        try {
          const objectUrl = URL.createObjectURL(item as File);
          setImagePreview(objectUrl);
          return;
        } catch {}
      }
    }
    setImagePreview(null);
  };

  useEffect(() => {
    setIsClientSide(true);
  }, []);

  useEffect(() => {
    const fetchTech = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/api/technologies");
        setTechOptions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setTechOptions([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (open) fetchTech();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const initialFiles = initialValues?.clientInvoices || [];
    if (Array.isArray(initialFiles) && initialFiles.length > 0) {
      setPreviewFromUploads(initialFiles as Array<File | string>);
    } else {
      setImagePreview(null);
    }
  }, [open, initialValues]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await api.get("/api/categories");
        setCategoryOptions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setCategoryOptions([]);
      }
    };
    if (open) fetchCategory();
  }, [open]);

  useEffect(() => {
    const fetchTag = async () => {
      try {
        const res = await api.get("/api/tags");
        setTagOptions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setTagOptions([]);
      }
    };
    if (open) fetchTag();
  }, [open]);

  const validationSchema = portfolioValidationSchema;

  const normalizeInitialValues = (iv: any) => ({
    projectName: iv?.projectName ?? "",
    websiteLink: iv?.websiteLink ?? "",
    technology: iv?.technology ?? "",
    category: iv?.category ?? "",
    industry: iv?.industry ?? "",
    description: iv?.description ?? "",
    pageBuilder: iv?.pageBuilder ?? "",
    clientName: iv?.clientName ?? "",
    clientInvoices: Array.isArray(iv?.clientInvoices) ? iv.clientInvoices : [],
    bidPlatform: iv?.bidPlatform ?? "",
    bidPlatformUrl: iv?.bidPlatformUrl ?? "",
    invoiceAmount: iv?.invoiceAmount ?? "",
    startDate: iv?.startDate ?? "",
    completionDate: iv?.completionDate ?? "",
    testimonials: iv?.testimonials ?? "",
    tag: iv?.tag ?? "",
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialValues
      ? normalizeInitialValues(initialValues)
      : {
          projectName: "",
          websiteLink: "",
          technology: "",
          category: "",
          industry: "",
          description: "",
          pageBuilder: "",
          clientName: "",
          clientInvoices: [] as (File | string)[],
          bidPlatform: "",
          bidPlatformUrl: "",
          invoiceAmount: "",
          startDate: "",
          completionDate: "",
          testimonials: "",
          tag: "",
        },
    validationSchema,
    onSubmit: async (values) => {
      const allUploads = (values.clientInvoices as Array<File | string>) || [];
      const existingUrls =
        (allUploads.filter((item) => typeof item === "string") as string[]) ||
        [];
      const newFiles =
        (allUploads.filter((item) => item instanceof File) as File[]) || [];

      async function uploadViaBackend(files: File[]): Promise<string[]> {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        const res = await api.post("/api/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const data = res.data;
        return Array.isArray(data.urls) ? data.urls : [];
      }

      const uploadedUrls =
        newFiles.length > 0 ? await uploadViaBackend(newFiles) : [];

      const payload: any = {
        projectName: values.projectName,
        websiteLink: values.websiteLink,
        technology: values.technology,
        category: values.category,
        industry: values.industry,
        description: values.description,
        pageBuilder: values.pageBuilder,
        clientName: values.clientName,
        clientInvoices: [...existingUrls, ...uploadedUrls],
        bidPlatform: values.bidPlatform,
        bidPlatformUrl: values.bidPlatformUrl,
        invoiceAmount:
          typeof values.invoiceAmount === "string" &&
          values.invoiceAmount !== ""
            ? Number(values.invoiceAmount)
            : values.invoiceAmount,
        startDate: values.startDate || undefined,
        completionDate: values.completionDate || undefined,
        testimonials: values.testimonials,
        tag: selectedTags,
      };

      // Remove undefined keys to avoid empty update
      Object.keys(payload).forEach(
        (k) => payload[k] === undefined && delete payload[k]
      );

      try {
        const response = await api.put(
          `/api/portfolios/${portfolioId}`,
          payload
        );
        if (response.status === 200) {
          // Notify parent to refresh its data without requiring a full page reload
          if (typeof onUpdated === "function") {
            onUpdated();
          } else {
            navigate(0);
          }
          toast.success("Project updated successfully!");
          handleCancel();
        }
      } catch (error) {
        toast.error("Failed to update project.");
      }
    },
  });

  // Keep preview in sync with current selections (existing + new)
  useEffect(() => {
    if (!open) return;
    if (Array.isArray(formik.values.clientInvoices)) {
      setPreviewFromUploads(
        formik.values.clientInvoices as Array<File | string>
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, formik.values.clientInvoices]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
      "application/pdf": [],
    },
    multiple: true,
    onDrop: (acceptedFiles) => {
      const updated = [
        ...((formik.values.clientInvoices as Array<File | string>) || []),
        ...acceptedFiles,
      ];
      formik.setFieldValue("clientInvoices", updated);
      setPreviewFromUploads(updated);
    },
  });

  const handleRemoveFileAtIndex = (indexToRemove: number) => {
    const updatedFiles = (
      formik.values.clientInvoices as Array<File | string>
    ).filter((_: File | string, idx: number) => idx !== indexToRemove);
    const removedItem = (formik.values.clientInvoices as Array<File | string>)[
      indexToRemove
    ];
    formik.setFieldValue("clientInvoices", updatedFiles);
    const removedWasPreview =
      (typeof removedItem === "string" && imagePreview === removedItem) ||
      (removedItem instanceof File &&
        removedItem.type.startsWith("image/") &&
        !!imagePreview);
    if (removedWasPreview) {
      setPreviewFromUploads(updatedFiles);
    }
  };

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const addNewTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleCancel = () => {
    formik.resetForm();
    setSelectedTags(initialValues?.tag || []);
    setNewTag("");
    setImagePreview(null);
    onOpenChange(false);
  };

  if (!isClientSide) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Portfolio Item
          </DialogTitle>
          <DialogDescription>
            Edit your portfolio item details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="projectName" className="text-sm font-medium">
              Project Name *
            </Label>
            <Input
              id="projectName"
              name="projectName"
              placeholder="Enter portfolio item title"
              value={formik.values.projectName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            />
            {formik.touched.projectName && formik.errors.projectName && (
              <p className="text-sm text-red-600">
                {formik.errors.projectName as string}
              </p>
            )}
          </div>

          {/* Website Link */}
          <div className="space-y-2">
            <Label htmlFor="websiteLink" className="text-sm font-medium">
              Website Link *
            </Label>
            <Input
              id="websiteLink"
              name="websiteLink"
              placeholder="https://example.com"
              value={formik.values.websiteLink}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="border-gray-200"
            />
            {formik.touched.websiteLink && formik.errors.websiteLink && (
              <p className="text-sm text-red-600">
                {formik.errors.websiteLink as string}
              </p>
            )}
          </div>

          {/* Technology Select */}
          <div className="space-y-2">
            <Label htmlFor="technology" className="text-sm font-medium">
              Technology *
            </Label>
            <select
              id="technology"
              name="technology"
              value={formik.values.technology}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full h-11 border border-gray-200 rounded-md focus:outline-none focus:ring-blue-500/20 px-3"
              disabled={isLoading}
            >
              <option value="">-- Select Technology --</option>
              {Array.isArray(techOptions) &&
                techOptions.map((tech, index) => (
                  <option
                    key={tech.id || tech.name || index}
                    value={tech.name || tech}
                  >
                    {tech.name || tech}
                  </option>
                ))}
            </select>
            {formik.touched.technology && formik.errors.technology && (
              <p className="text-sm text-red-600">
                {formik.errors.technology as string}
              </p>
            )}
          </div>

          {/* Category Select */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Select Category
            </Label>
            <select
              id="category"
              name="category"
              value={formik.values.category}
              onChange={formik.handleChange}
              className="w-full h-11 border border-gray-200 rounded-md focus:outline-none focus:ring-blue-500/20 px-3"
              disabled={isLoading}
            >
              <option value="">-- Select Category --</option>
              {Array.isArray(categoryOptions) &&
                categoryOptions.map((category, index) => (
                  <option
                    key={category.id || category.name || index}
                    value={category.name || category}
                  >
                    {category.name || category}
                  </option>
                ))}
            </select>
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <Label htmlFor="industry" className="text-sm font-medium">
              Industry
            </Label>
            <Input
              id="industry"
              name="industry"
              placeholder="e.g. E-commerce, Finance"
              value={formik.values.industry}
              onChange={formik.handleChange}
              className="border-gray-200"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description *
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your portfolio item..."
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
              rows={4}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>

          {/* Page Builder */}
          <div className="space-y-2">
            <Label htmlFor="pageBuilder" className="text-sm font-medium">
              Select Page Builder
            </Label>
            <select
              id="pageBuilder"
              name="pageBuilder"
              value={formik.values.pageBuilder}
              onChange={formik.handleChange}
              className="w-full h-11 border border-gray-200 rounded-md focus:outline-none focus:ring-blue-500/20 px-3"
            >
              <option value="">-- Select Page Builder --</option>
              <option value="Webflow">Webflow</option>
              <option value="Elementor">Elementor</option>
              <option value="WordPress">WordPress</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          {/* Client Name */}
          <div className="space-y-2">
            <Label htmlFor="clientName" className="text-sm font-medium">
              Client Name
            </Label>
            <Input
              id="clientName"
              name="clientName"
              placeholder="Enter client name"
              value={formik.values.clientName}
              onChange={formik.handleChange}
              className="border-gray-200"
            />
          </div>

          {/* Bid Platform */}
          <div className="space-y-2">
            <Label htmlFor="bidPlatform" className="text-sm font-medium">
              Bid Platform
            </Label>
            <Input
              id="bidPlatform"
              name="bidPlatform"
              placeholder="Upwork, Freelancer, etc."
              value={formik.values.bidPlatform}
              onChange={formik.handleChange}
              className="border-gray-200"
            />
          </div>

          {/* Bid Platform URL */}
          <div className="space-y-2">
            <Label htmlFor="bidPlatformUrl" className="text-sm font-medium">
              Bid Platform URL
            </Label>
            <Input
              id="bidPlatformUrl"
              name="bidPlatformUrl"
              placeholder="https://example.com"
              value={formik.values.bidPlatformUrl}
              onChange={formik.handleChange}
              className="border-gray-200"
            />
          </div>

          {/* Invoice Amount */}
          <div className="space-y-2">
            <Label htmlFor="invoiceAmount" className="text-sm font-medium">
              Invoice Amount
            </Label>
            <Input
              id="invoiceAmount"
              name="invoiceAmount"
              placeholder="e.g. 5000"
              type="number"
              value={formik.values.invoiceAmount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="border-gray-200"
            />

            {formik.touched.invoiceAmount && formik.errors.invoiceAmount && (
              <p className="text-sm text-red-600">
                {formik.errors.invoiceAmount as string}
              </p>
            )}
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm font-medium">
              Start Date
            </Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formik.values.startDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="border-gray-200"
            />
            {formik.touched.startDate && formik.errors.startDate && (
              <p className="text-sm text-red-600">
                {formik.errors.startDate as string}
              </p>
            )}
          </div>

          {/* Completion Date */}
          <div className="space-y-2">
            <Label htmlFor="completionDate" className="text-sm font-medium">
              Completion Date
            </Label>
            <Input
              id="completionDate"
              name="completionDate"
              type="date"
              value={formik.values.completionDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="border-gray-200"
            />
            {formik.touched.completionDate && formik.errors.completionDate && (
              <p className="text-sm text-red-600">
                {formik.errors.completionDate as string}
              </p>
            )}
          </div>

          {/* Testimonials */}
          <div className="space-y-2">
            <Label htmlFor="testimonials" className="text-sm font-medium">
              Testimonials
            </Label>
            <Textarea
              id="testimonials"
              name="testimonials"
              placeholder="What the client said..."
              rows={3}
              value={formik.values.testimonials}
              onChange={formik.handleChange}
              className="border-gray-200"
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tags</Label>
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 pr-1"
                  >
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 hover:bg-blue-200"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            {/* Add New Tag */}
            <div className="flex gap-2">
              <Input
                placeholder="Add custom tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addNewTag())
                }
                className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addNewTag}
                disabled={!newTag.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {/* Available Tags */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Popular tags:</p>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(tagOptions) &&
                  tagOptions
                    .filter((tag) => !selectedTags.includes(tag.name || tag))
                    .slice(0, 10)
                    .map((tag, index) => (
                      <Button
                        key={tag._id || tag.id || tag.name || index}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addTag(tag.name || tag)}
                        className="text-xs h-7 border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                      >
                        {tag.name || tag}
                      </Button>
                    ))}
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Files & Images</Label>
            {/* Display uploaded files */}
            {formik.values.clientInvoices.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Uploaded files:</p>
                <div className="space-y-2">
                  {formik.values.clientInvoices.map(
                    (file: File | string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                      >
                        <span className="text-sm break-words">
                          {typeof file === "string"
                            ? extractFileNameFromUrl(file)
                            : file.name}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFileAtIndex(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
            {/* Image Preview */}
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 bg-white/90 hover:bg-white"
                  onClick={() => setImagePreview(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500">Images, PDFs up to 10MB</p>
              </div>
            </div>
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
              {formik.isSubmitting ? "Updating..." : "Update Portfolio Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
