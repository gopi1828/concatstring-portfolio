import * as Yup from "yup";

export const categoryValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Category name is required")
    .min(2, "Category name must be at least 2 characters"),
});
