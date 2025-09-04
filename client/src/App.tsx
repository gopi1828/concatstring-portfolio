import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'
import { RequireAuth, RedirectIfAuth } from './lib/routeGuards'
import { LoginPage } from './components/login-page'
import { PortfolioPage } from './components/portfolio-page'
import { MainLayout } from './components/main-layout'
import { PortfolioDetailPage } from './components/portfolio-detail-page'
import { RegisterPage } from './components/register-page'
import { CategoriesPage } from './components/categories-page'
import { TechnologiesPage } from './components/technologies-page'
import { TagsPage } from './components/tags-page'
import { EditUserForm } from './components/edit-user-form'
import { Toaster } from 'react-hot-toast'

const App = () => {
  const PortfolioDetailRoute = () => {
    const { id } = useParams();
    return (
      <RequireAuth>
        <MainLayout>
          <PortfolioDetailPage id={id ?? ''} />
        </MainLayout>
      </RequireAuth>
    );
  };
  return (
    <div>
       <Toaster position="top-right" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />

          {/* Dashboard routes with shared layout */}
          <Route
            path='/dashboard'
            element={
              <RequireAuth>
                <MainLayout>
                  <PortfolioPage />
                </MainLayout>
              </RequireAuth>
            }
          />
          <Route path='/dashboard/portfolio/:id' element={<PortfolioDetailRoute />} />
          <Route
            path='/dashboard/register'
            element={
              <RequireAuth>
                <MainLayout>
                  <RegisterPage />
                </MainLayout>
              </RequireAuth>
            }
          />
          <Route
            path='/dashboard/categories'
            element={
              <RequireAuth>
                <MainLayout>
                  <CategoriesPage />
                </MainLayout>
              </RequireAuth>
            }
          />
          <Route
            path='/dashboard/technologies'
            element={
              <RequireAuth>
                <MainLayout>
                  <TechnologiesPage />
                </MainLayout>
              </RequireAuth>
            }
          />
          <Route
            path='/dashboard/tags'
            element={
              <RequireAuth>
                <MainLayout>
                  <TagsPage />
                </MainLayout>
              </RequireAuth>
            }
          />
          <Route
            path='/dashboard/edit-user'
            element={
              <RequireAuth>
                <MainLayout>
                  <EditUserForm />
                </MainLayout>
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App