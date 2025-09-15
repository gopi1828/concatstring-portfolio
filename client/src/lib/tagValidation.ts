import * as Yup from "yup";

export const tagValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Tag name is required")
    .min(2, "Tag name must be at least 2 characters"),
});
