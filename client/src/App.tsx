import { BrowserRouter, Route, Routes } from 'react-router'
import { LoginPage } from './components/login-page'
import { PortfolioPage } from './components/portfolio-page'

const App = () => {
  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<LoginPage />} />
        <Route path='/dashboard' element={<PortfolioPage />} />
        
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App