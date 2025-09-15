import * as Yup from "yup";

export const portfolioValidationSchema = Yup.object().shape({
  projectName: Yup.string()
    .required("Project name is required")
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name must be less than 100 characters"),
  websiteLink: Yup.string()
    .url("Invalid URL format")
    .required("Website link is required")
    .matches(
      /^https?:\/\/.+/,
      "Website link must start with http:// or https://"
    ),
  technology: Yup.string().required("Technology is required"),
  category: Yup.string().optional(),
  industry: Yup.string().optional(),
  pageBuilder: Yup.string().optional(),
  clientName: Yup.string()
    .max(100, "Client name must be less than 100 characters")
    .optional(),
  bidPlatform: Yup.string()
    .max(50, "Bid platform must be less than 50 characters")
    .optional(),
  bidPlatformUrl: Yup.string()
    .url("Invalid URL format")
    .optional(),
  invoiceAmount: Yup.number()
    .positive("Invoice amount must be a positive number")
    .max(999999, "Invoice amount must be less than 999,999")
    .optional(),
  startDate: Yup.date()
    .max(new Date(), "Start date cannot be in the future")
    .optional(),
  completionDate: Yup.date()
    .min(
      Yup.ref("startDate"),
      "Completion date cannot be before start date"
    )
    .optional(),
  testimonials: Yup.string()
    .max(500, "Testimonials must be less than 500 characters")
    .optional(),
  tag: Yup.array().optional(),
});
