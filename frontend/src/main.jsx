import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import Router from './Routes/Router.jsx'
import AuthProviders from './providers/AuthProviders.jsx'
import { HelmetProvider } from 'react-helmet-async';
import './i18n';
import { SiteSettingsProvider } from './Context/SiteSettingsContext.jsx'
import { CartProvider } from './Context/CartContext.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <AuthProviders>
        <CartProvider>
          <SiteSettingsProvider>
            <div className='max-w-screen- mx-auto bg-primary dark:bg-primary-dark font-time'>
              <RouterProvider router={Router} />
            </div>
          </SiteSettingsProvider>
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
