import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import fs from 'fs'
import path from 'path'

export default async function DashboardPage() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Lire le dashboard HTML
  const htmlPath = path.join(process.cwd(), 'public/alma-plus-dashboard.html')
  let html = ''
  if (fs.existsSync(htmlPath)) {
    html = fs.readFileSync(htmlPath, 'utf-8')
    // Injecter l'email utilisateur dans le HTML
    html = html.replace('{{USER_EMAIL}}', user.email || '')
    html = html.replace('{{USER_ID}}', user.id || '')
  }

  return (
    <html suppressHydrationWarning>
      <body dangerouslySetInnerHTML={{ __html: html.replace(/^[\s\S]*<body[^>]*>|<\/body>[\s\S]*$/gi, '') }} />
    </html>
  )
}
