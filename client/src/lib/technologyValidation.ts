import * as Yup from "yup";

export const technologyValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Technology name is required")
    .min(2, "Technology name must be at least 2 characters"),
  category: Yup.string()
    .required("Category is required"),
});
