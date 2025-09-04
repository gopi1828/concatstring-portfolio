import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'
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
      <MainLayout>
        <PortfolioDetailPage id={id ?? ''} />
      </MainLayout>
    );
  };
  return (
    <div>
       <Toaster position="top-right" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<LoginPage />} />

          {/* Dashboard routes with shared layout */}
          <Route
            path='/dashboard'
            element={
              <MainLayout>
                <PortfolioPage />
              </MainLayout>
            }
          />
          <Route path='/dashboard/portfolio/:id' element={<PortfolioDetailRoute />} />
          <Route
            path='/dashboard/register'
            element={
              <MainLayout>
                <RegisterPage />
              </MainLayout>
            }
          />
          <Route
            path='/dashboard/categories'
            element={
              <MainLayout>
                <CategoriesPage />
              </MainLayout>
            }
          />
          <Route
            path='/dashboard/technologies'
            element={
              <MainLayout>
                <TechnologiesPage />
              </MainLayout>
            }
          />
          <Route
            path='/dashboard/tags'
            element={
              <MainLayout>
                <TagsPage />
              </MainLayout>
            }
          />
          <Route
            path='/dashboard/edit-user'
            element={
              <MainLayout>
                <EditUserForm />
              </MainLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App