import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const html = readFileSync(join(process.cwd(), 'public', 'alma-plus-landing.html'), 'utf8')
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  })
}
```

**4. Renomme ce fichier en `app/route.js`** — pas `page.js`, **`route.js`**

Donc la structure finale :
```
app/
  route.js        ← landing
  layout.js
  login/page.js
  dashboard/page.js
