import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TDSMobileProvider } from '@toss/tds-mobile'
import './index.css'
import { App } from './app/App.tsx'
import { AppProvider } from './state/AppContext.tsx'
import { ToastProvider } from './state/ToastContext.tsx'

const isAndroid = /android/i.test(navigator.userAgent)
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TDSMobileProvider
      userAgent={{
        isAndroid,
        isIOS,
        fontA11y: undefined,
        fontScale: undefined,
      }}
    >
      <AppProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AppProvider>
    </TDSMobileProvider>
  </StrictMode>,
)
