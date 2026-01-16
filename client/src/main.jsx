import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast';
import { QuizProvider } from './context/QuizContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QuizProvider>
      <App />
      <Toaster position="top-center" />
    </QuizProvider>
  </StrictMode>,
)
