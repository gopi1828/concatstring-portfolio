import * as Yup from "yup";

export const categoryValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name must be less than 50 characters")
    .matches(
      /^[a-zA-Z0-9\s\-_]+$/,
      "Category name can only contain letters, numbers, spaces, hyphens, and underscores"
    ),
  description: Yup.string()
    .max(200, "Description must be less than 200 characters")
    .optional(),
  icon: Yup.string()
    .required("Icon is required"),
});
