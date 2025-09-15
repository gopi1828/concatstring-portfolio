import * as Yup from "yup";

export const technologyValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Technology name is required")
    .min(2, "Technology name must be at least 2 characters"),
  description: Yup.string()
    .max(200, "Description must be less than 200 characters")
    .optional(),
  category: Yup.string()
    .required("Category is required"),
  icon: Yup.string()
    .required("Icon is required"),
});
