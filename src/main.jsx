import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import './index.css'

// Import the generated route tree
import { routeTree } from '@/routeTree.gen'
import { ThemeProvider } from '@/components/theme-provider'

// Create a new router instance
const router = createRouter({ routeTree })

ReactDOM.createRoot(document.getElementById('root')).render(
   <React.StrictMode>
      <ThemeProvider>
         <RouterProvider router={router} />
      </ThemeProvider>
   </React.StrictMode>
)
