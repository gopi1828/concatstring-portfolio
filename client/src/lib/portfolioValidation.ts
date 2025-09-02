import * as Yup from "yup";

export const portfolioValidationSchema = Yup.object().shape({
  projectName: Yup.string().required("Project name is required"),
  websiteLink: Yup.string()
    .url("Invalid URL")
    .required("Website link is required"),
  technology: Yup.string().required("Technology is required"),
  invoiceAmount: Yup.number().positive(
    "Invoice amount must be a positive number"
  ),
  startDate: Yup.date().max(new Date(), "Start date cannot be in the future"),
  completionDate: Yup.date().min(
    Yup.ref("startDate"),
    "Completion date cannot be before start date"
  ),
});
