import * as Yup from "yup";

export const industryValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Industry name is required")
    .min(2, "Industry name must be at least 2 characters"),
});
