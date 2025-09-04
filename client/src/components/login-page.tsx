import { useFormik } from "formik";
import * as Yup from "yup";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Eye, EyeOff, FolderOpen } from "lucide-react";
import { useState } from "react";
import api from "../lib/api";

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .required("Username is required")
        .min(3, "Username must be at least 3 characters"),
      password: Yup.string()
        .required("Password is required")
        .min(4, "Password must be at least 4 characters"),
    }),
    onSubmit: async (values) => {
            
      setIsLoading(true);

      const trimmedValues = {
        username: values.username.trim(),
        password: values.password.trim(),
      };


      try {
        const response = await api.post("/api/auth/login", trimmedValues);

        if (response.status === 200) {
          toast.success("Login successful!");
          const { token } = response.data;

          try {
            localStorage.setItem("token", token);
          } catch (e) {
            toast.error("Failed to save token. Please check browser settings.");
            return;
          }

          navigate("/dashboard");
        }
      } catch (error) {
        const err = error as AxiosError<any>;
        const raw = err.response?.data;
        const message =
          (typeof raw === "string" && raw) ||
          (typeof raw?.message === "string" && raw.message) ||
          (typeof raw?.error === "string" && raw.error) ||
          "Something went wrong. Please try again.";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FolderOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Login
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to manage your portfolio
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={formik.handleSubmit}
            method="POST"
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-gray-700"
              >
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
              {formik.touched.username && formik.errors.username && (
                <p className="text-sm text-red-600 -mt-2">
                  {formik.errors.username}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="h-11 pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-11 w-11 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-sm text-red-600 -mt-2">
                  {formik.errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!formik.isValid || isLoading}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
