import * as Yup from "yup";

export const industryValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Industry name is required")
    .min(2, "Industry name must be at least 2 characters")
    .max(50, "Industry name must be less than 50 characters")
    .matches(
      /^[a-zA-Z0-9\s\-_&]+$/,
      "Industry name can only contain letters, numbers, spaces, hyphens, underscores, and ampersands"
    ),
});
