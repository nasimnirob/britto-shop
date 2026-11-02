import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import Router from './Routes/Router.jsx'
import AuthProviders from './providers/AuthProviders.jsx'
import { HelmetProvider } from 'react-helmet-async';
import './i18n';
import { CartProvider } from './Context/CartContext.jsx'
import { SettingsProvider } from './Context/SettingsContext.jsx'
import { Toaster } from 'react-hot-toast'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <AuthProviders>
        <CartProvider>
          <SettingsProvider>
            <div className='max-w-screen- mx-auto bg-primary dark:bg-primary-dark text-[#080809] dark:text-[#E2E5E6] font-poppins'>
              <RouterProvider router={Router} />
              <Toaster />
            </div>
          </SettingsProvider>
        </CartProvider>
      </AuthProviders>
    </HelmetProvider>
  </StrictMode>,
)



// if (
//   localStorage.theme === 'dark' ||
//   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
// ) {
//   document.documentElement.classList.add('dark');
// } else {
//   document.documentElement.classList.remove('dark');
// }
