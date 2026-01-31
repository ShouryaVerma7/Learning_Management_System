import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { appStore } from './app/store'
import { Toaster } from './components/ui/sonner'
import { useLoadUserQuery } from './features/api/authApi'
import LoadingSpinner from './components/LoadingSpinner'
import { ThemeProvider } from './components/theme-provider'

const Custom = ({children}) => {
  const {isLoading} = useLoadUserQuery();
  return <>{isLoading ? <LoadingSpinner/> : <>{children}</>}</>
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={appStore}>
      <ThemeProvider defaultTheme="system" storageKey="lms-ui-theme">
        <Custom>
          <App />
          <Toaster/>
        </Custom>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)