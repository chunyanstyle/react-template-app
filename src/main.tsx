import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import TanStackQueryProvider from './integrations/tanstack-query/root-provider'
import { getRouter } from './router'

const router = getRouter()

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <TanStackQueryProvider>
        <RouterProvider router={router} />
      </TanStackQueryProvider>
    </StrictMode>,
  )
}
