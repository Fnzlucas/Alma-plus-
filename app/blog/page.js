import Link from 'next/link'
import { getAllArticles } from '@/lib/blog'

export const metadata = {
  title: 'Blog — Conseils prospection & acquisition clients | Alma.+',
  description: 'Stratégies concrètes pour trouver des clients : prospection automatique, Google Maps, INSEE, Ma Prime Rénov. Pour artisans, consultants et entrepreneurs français.',
  alternates: { canonical: 'https://alma-plus.fr/blog' },
  openGraph: {
    title: 'Blog Alma.+ — Conseils prospection',
    description: 'Stratégies concrètes pour trouver des clients automatiquement.',
    url: 'https://alma-plus.fr/blog',
    siteName: 'Alma.+',
    locale: 'fr_FR',
    type: 'website',
  },
}

export default function BlogPage() {
  const articles = getAllArticles()

  const categories = [...new Set(articles.map(a => a.category).filter(Boolean))]

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#f7f8fa', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '0 52px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: '#1e3a6e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 14 14" fill="none" width="13" height="13"><path d="M2 12L7 2L12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 8.5H10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </div>
          <span style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 800, fontSize: 15, color: '#0f1729', letterSpacing: '-0.5px' }}>Alma<span style={{ color: '#1e3a6e' }}>.</span>+</span>
        </Link>
        <div style={{ display: 'flex', gap: 6 }}>
          <Link href="/" style={{ fontSize: 13, color: '#4a5568', textDecoration: 'none', padding: '9px 16px', borderRadius: 7, border: '1px solid rgba(0,0,0,0.09)' }}>Accueil</Link>
          <Link href="/login" style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: '#1e3a6e', textDecoration: 'none', padding: '9px 20px', borderRadius: 7 }}>Démarrer gratuit →</Link>
        </div>
      </nav>

      {/* HERO BLOG */}
      <section style={{ background: '#fff', padding: '72px 52px 64px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(30,58,110,0.07)', border: '1px solid rgba(30,58,110,0.14)', padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, color: '#1e3a6e', marginBottom: 24 }}>
            Conseils & stratégies
          </div>
          <h1 style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-2px', color: '#0f1729', marginBottom: 16, lineHeight: 1.1 }}>
            Trouver des clients,<br />
            <span style={{ color: '#1e3a6e' }}>mode d'emploi.</span>
          </h1>
          <p style={{ fontSize: 17, color: '#4a5568', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
            Stratégies concrètes pour artisans, consultants et entrepreneurs. Pas de théorie — des méthodes qui fonctionnent.
          </p>
        </div>
      </section>

      {/* ARTICLES */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 52px' }}>

        {articles.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 15, padding: '80px 0' }}>
            Les premiers articles arrivent bientôt.
          </div>
        ) : (
          <>
            {/* Article featured */}
            {articles[0] && (
              <Link href={`/blog/${articles[0].slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 40 }}>
                <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 16, padding: '36px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center', transition: 'all 0.15s', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #1e3a6e, #2563eb)' }}></div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      {articles[0].category && <span style={{ fontSize: 11, fontWeight: 700, color: '#1e3a6e', background: 'rgba(30,58,110,0.08)', padding: '3px 10px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{articles[0].category}</span>}
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>{articles[0].readTime}</span>
                    </div>
                    <h2 style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 26, fontWeight: 900, letterSpacing: '-0.8px', color: '#0f1729', marginBottom: 12, lineHeight: 1.2 }}>{articles[0].title}</h2>
                    <p style={{ fontSize: 14, color: '#4a5568', lineHeight: 1.7, marginBottom: 20 }}>{articles[0].description}</p>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3a6e' }}>Lire l'article →</span>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #1e3a6e, #2563eb)', borderRadius: 12, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 64, fontWeight: 900, color: 'rgba(255,255,255,0.15)' }}>A+</span>
                  </div>
                </div>
              </Link>
            )}

            {/* Grille articles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {articles.slice(1).map(article => (
                <Link key={article.slug} href={`/blog/${article.slug}`} style={{ textDecoration: 'none' }}>
                  <article style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 14, padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.15s', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #1e3a6e, #2563eb)', opacity: 0.4 }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      {article.category && <span style={{ fontSize: 10, fontWeight: 700, color: '#1e3a6e', background: 'rgba(30,58,110,0.08)', padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{article.category}</span>}
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{article.readTime}</span>
                    </div>
                    <h2 style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 16, fontWeight: 800, letterSpacing: '-0.3px', color: '#0f1729', marginBottom: 8, lineHeight: 1.3, flex: 1 }}>{article.title}</h2>
                    <p style={{ fontSize: 12, color: '#4a5568', lineHeight: 1.6, marginBottom: 16 }}>{article.description?.substring(0, 100)}...</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#1e3a6e' }}>Lire →</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      {/* CTA */}
      <section style={{ background: '#1e3a6e', padding: '64px 52px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-1.2px', marginBottom: 12 }}>Prêt à trouver vos clients automatiquement ?</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 28 }}>7 jours gratuits. Carte bancaire requise.</p>
          <Link href="/login" style={{ background: '#fff', color: '#1e3a6e', fontSize: 15, fontWeight: 800, padding: '14px 28px', borderRadius: 9, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Démarrer gratuitement →
          </Link>
        </div>
      </section>

      <footer style={{ background: '#152d57', padding: '32px 52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 800, fontSize: 14, color: '#fff' }}>Alma<span style={{ color: 'rgba(255,255,255,0.4)' }}>.</span>+</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>© 2026 Alma.+ · Tous droits réservés</span>
      </footer>

    </main>
  )
}
