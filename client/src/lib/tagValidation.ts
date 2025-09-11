import * as Yup from "yup";

export const tagValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Tag name is required")
    .min(2, "Tag name must be at least 2 characters")
    .max(50, "Tag name must be less than 50 characters")
    .matches(
      /^[a-zA-Z0-9\s\-_]+$/,
      "Tag name can only contain letters, numbers, spaces, hyphens, and underscores"
    ),
});
