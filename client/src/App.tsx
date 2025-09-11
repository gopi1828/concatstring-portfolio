import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { RequireAuth, RedirectIfAuth } from "./lib/routeGuards";
import { MainLayout } from "./components/main-layout";
import { LoginPage } from "./components/login-page";
import { RegisterPage } from "./components/register-page";
import { PortfolioPage } from "./components/portfolio-page";
import { CategoriesPage } from "./components/categories-page";
import { TechnologiesPage } from "./components/technologies-page";
import { TagsPage } from "./components/tags-page";
import { IndustryPage } from "./components/industry-page";
import { EditUserForm } from "./components/edit-user-form";
import { PortfolioDetailPage } from "./components/portfolio-detail-page";

// Wrapper component to extract id from URL params
function PortfolioDetailPageWrapper() {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    return <Navigate to="/dashboard" replace />;
  }
  return <PortfolioDetailPage id={id} />;
}

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          success: {
            duration: 3000,
            style: {
              background: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0',
            },
            iconTheme: {
              primary: '#22c55e',
              secondary: '#ffffff',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <Router>
        <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <RedirectIfAuth>
              <LoginPage />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectIfAuth>
              <RegisterPage />
            </RedirectIfAuth>
          }
        />

        {/* Protected dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <MainLayout>
                <PortfolioPage />
              </MainLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard/categories"
          element={
            <RequireAuth>
              <MainLayout>
                <CategoriesPage />
              </MainLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard/technologies"
          element={
            <RequireAuth>
              <MainLayout>
                <TechnologiesPage />
              </MainLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard/tags"
          element={
            <RequireAuth>
              <MainLayout>
                <TagsPage />
              </MainLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard/industries"
          element={
            <RequireAuth>
              <MainLayout>
                <IndustryPage />
              </MainLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard/register"
          element={
            <RequireAuth>
              <MainLayout>
                <RegisterPage />
              </MainLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard/edit-user"
          element={
            <RequireAuth>
              <MainLayout>
                <EditUserForm />
              </MainLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard/portfolio/:id"
          element={
            <RequireAuth>
              <MainLayout>
                <PortfolioDetailPageWrapper />
              </MainLayout>
            </RequireAuth>
          }
        />

        {/* Catch all route - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
