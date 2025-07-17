import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import fs from 'fs'
import type { ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'

// custom plugin to serve available years API
const availableYearsPlugin = () => {
  return {
    name: 'available-years-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/available-years', (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (req.method === 'GET') {
          try {
            const calendarPath = path.join(__dirname, 'public', 'data', 'calender')
            
            if (!fs.existsSync(calendarPath)) {
              res.writeHead(404, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Calendar directory not found' }))
              return
            }

            const years = fs.readdirSync(calendarPath, { withFileTypes: true })
              .filter(dirent => dirent.isDirectory())
              .map(dirent => {
                const yearValue = dirent.name
                let label = ''
                
                if (yearValue === '2425') {
                  label = '2024-25'
                } else if (yearValue === '2526') {
                  label = '2025-26'
                } else {
                  const first = yearValue.slice(0, 2)
                  const second = yearValue.slice(2, 4)
                  label = `20${first}-${second}`
                }
                
                return {
                  value: yearValue,
                  label: label
                }
              })
              .sort((a, b) => a.value.localeCompare(b.value))

            res.writeHead(200, { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            })
            res.end(JSON.stringify(years))
          } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Failed to read calendar directories' }))
          }
        } else {
          next()
        }
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), availableYearsPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['pyodide']
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    }
  }
})
