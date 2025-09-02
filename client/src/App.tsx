import { BrowserRouter, Route, Routes } from 'react-router'
import { LoginPage } from './components/login-page'

const App = () => {
  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<LoginPage />} />
        
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App