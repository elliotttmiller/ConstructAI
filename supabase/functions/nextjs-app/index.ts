import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const pathname = url.pathname

    // Serve static assets from Supabase Storage
    if (pathname.startsWith('/static/') || pathname.startsWith('/_next/')) {
      return await serveStaticAsset(pathname)
    }

    // Serve the main application
    return await serveApp(req)

  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function serveStaticAsset(pathname: string) {
  // In production, static assets would be served from Supabase Storage
  // For now, return a basic response
  return new Response('Static asset not found', {
    status: 404,
    headers: corsHeaders
  })
}

async function serveApp(req: Request) {
  const url = new URL(req.url)
  const pathname = url.pathname

  // Basic routing for the ConstructAI platform
  let htmlContent = ''

  switch (pathname) {
    case '/':
      htmlContent = await getIndexPage()
      break
    case '/chat':
      htmlContent = await getChatPage()
      break
    case '/bim':
      htmlContent = await getBIMPage()
      break
    case '/projects':
      htmlContent = await getProjectsPage()
      break
    case '/team':
      htmlContent = await getTeamPage()
      break
    case '/documents':
      htmlContent = await getDocumentsPage()
      break
    case '/auth/signin':
      htmlContent = await getSignInPage()
      break
    default:
      htmlContent = await get404Page()
  }

  return new Response(htmlContent, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/html',
    },
  })
}

async function getIndexPage() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ConstructAI - AI Construction Platform</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: '#0f172a',
                        secondary: '#1e293b'
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <div class="text-center mb-8">
            <div class="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
            </div>
            <h1 class="text-4xl font-bold text-gray-900 mb-2">ConstructAI</h1>
            <p class="text-xl text-gray-600">AI-Powered Construction Management Platform</p>
        </div>

        <div class="max-w-4xl mx-auto">
            <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
                <h2 class="text-2xl font-bold mb-4">Welcome to ConstructAI</h2>
                <p class="text-gray-600 mb-6">Revolutionary construction project management through automated document processing, 2D-to-3D conversion, building codes compliance, and real-time project coordination.</p>

                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-blue-900">Active Projects</h3>
                        <p class="text-2xl font-bold text-blue-600">12</p>
                        <p class="text-sm text-blue-700">+2 from last month</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-green-900">AI Agents Active</h3>
                        <p class="text-2xl font-bold text-green-600">8/8</p>
                        <p class="text-sm text-green-700">All systems operational</p>
                    </div>
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-purple-900">Documents Processed</h3>
                        <p class="text-2xl font-bold text-purple-600">1,234</p>
                        <p class="text-sm text-purple-700">+180 today</p>
                    </div>
                    <div class="bg-orange-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-orange-900">Compliance Score</h3>
                        <p class="text-2xl font-bold text-orange-600">98.5%</p>
                        <p class="text-sm text-orange-700">Building codes compliance</p>
                    </div>
                </div>

                <div class="text-center">
                    <a href="/auth/signin" class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors">
                        Sign In to Continue
                    </a>
                </div>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 class="font-semibold text-blue-900 mb-3">Demo Accounts</h3>
                <div class="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p class="font-medium text-blue-800">Administrator:</p>
                        <p class="text-blue-700">admin@constructai.demo</p>
                    </div>
                    <div>
                        <p class="font-medium text-blue-800">Project Manager:</p>
                        <p class="text-blue-700">manager@constructai.demo</p>
                    </div>
                    <div>
                        <p class="font-medium text-blue-800">Architect:</p>
                        <p class="text-blue-700">architect@constructai.demo</p>
                    </div>
                </div>
                <p class="text-blue-700 pt-2">
                    Password for all accounts: <code class="bg-blue-100 px-1 rounded">Check .env.local file</code>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
  `
}

async function getSignInPage() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In - ConstructAI</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full space-y-6 p-6">
        <div class="text-center">
            <div class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
            </div>
            <h1 class="text-2xl font-bold">ConstructAI</h1>
            <p class="text-gray-600">AI Construction Platform</p>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-semibold mb-2">Sign In</h2>
            <p class="text-gray-600 mb-6">Enter your credentials to access the platform</p>

            <form class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" placeholder="admin@constructai.demo"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input type="password" placeholder="Enter your password"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                </div>
                <button type="submit" class="w-full bg-primary text-white py-2 rounded-md hover:bg-secondary transition-colors">
                    Sign In
                </button>
            </form>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 class="font-medium text-blue-900 mb-3">Demo Accounts</h3>
            <div class="grid grid-cols-3 gap-4 text-sm">
                <div>
                    <p class="font-medium text-blue-800">Administrator:</p>
                    <p class="text-blue-700">admin@constructai.demo</p>
                </div>
                <div>
                    <p class="font-medium text-blue-800">Manager:</p>
                    <p class="text-blue-700">manager@constructai.demo</p>
                </div>
                <div>
                    <p class="font-medium text-blue-800">Architect:</p>
                    <p class="text-blue-700">architect@constructai.demo</p>
                </div>
            </div>
            <p class="text-blue-700 pt-2">
                Password: <code class="bg-blue-100 px-1 rounded">Check .env.local file</code>
            </p>
        </div>
    </div>

    <script>
        // Redirect to main app for demo
        document.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            window.location.href = '/';
        });
    </script>
</body>
</html>
  `
}

async function getChatPage() {
  return getAppPage("AI Assistant Chat", "Real-time AI assistant for construction project coordination")
}

async function getBIMPage() {
  return getAppPage("3D BIM Viewer", "Interactive 3D building information modeling and clash detection")
}

async function getProjectsPage() {
  return getAppPage("Projects", "Manage construction projects with AI-powered insights")
}

async function getTeamPage() {
  return getAppPage("Team Directory", "Role-based team management and collaboration")
}

async function getDocumentsPage() {
  return getAppPage("Document Processing", "AI-powered document processing with OCR and classification")
}

async function getAppPage(title: string, description: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ConstructAI</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="bg-white shadow-sm border-b">
        <div class="container mx-auto px-4 py-4 flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                </div>
                <h1 class="text-xl font-bold">ConstructAI</h1>
            </div>
            <nav class="hidden md:flex space-x-6">
                <a href="/" class="text-gray-600 hover:text-primary">Dashboard</a>
                <a href="/chat" class="text-gray-600 hover:text-primary">Chat</a>
                <a href="/bim" class="text-gray-600 hover:text-primary">3D BIM</a>
                <a href="/projects" class="text-gray-600 hover:text-primary">Projects</a>
                <a href="/team" class="text-gray-600 hover:text-primary">Team</a>
                <a href="/documents" class="text-gray-600 hover:text-primary">Documents</a>
            </nav>
        </div>
    </div>

    <div class="container mx-auto px-4 py-8">
        <div class="mb-8">
            <h2 class="text-3xl font-bold mb-2">${title}</h2>
            <p class="text-gray-600">${description}</p>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-8">
            <div class="text-center py-12">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold mb-2">Feature Coming Soon</h3>
                <p class="text-gray-600 mb-6">This ${title.toLowerCase()} feature is being migrated to Supabase Edge Functions.</p>
                <p class="text-sm text-blue-600">The full Next.js application with all features will be available once the build process is complete.</p>
            </div>
        </div>
    </div>
</body>
</html>
  `
}

async function get404Page() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Not Found - ConstructAI</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
    <div class="text-center">
        <h1 class="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
        <p class="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
        <a href="/" class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors">
            Return Home
        </a>
    </div>
</body>
</html>
  `
}
