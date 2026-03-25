import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllArticles, getArticleBySlug } from '@/lib/blog'

export async function generateStaticParams() {
  const articles = getAllArticles()
  return articles.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }) {
  const article = getArticleBySlug(params.slug)
  if (!article) return {}
  return {
    title: `${article.title} | Blog Alma.+`,
    description: article.description,
    alternates: { canonical: `https://alma-plus.fr/blog/${params.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://alma-plus.fr/blog/${params.slug}`,
      siteName: 'Alma.+',
      locale: 'fr_FR',
      type: 'article',
      publishedTime: article.date,
    },
  }
}

const mdxComponents = {
  h1: (props) => <h1 style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#0f1729', marginBottom: 20, lineHeight: 1.1 }} {...props} />,
  h2: (props) => <h2 style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, letterSpacing: '-0.8px', color: '#0f1729', marginTop: 48, marginBottom: 16, lineHeight: 1.2 }} {...props} />,
  h3: (props) => <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f1729', marginTop: 32, marginBottom: 12 }} {...props} />,
  p: (props) => <p style={{ fontSize: 16, color: '#4a5568', lineHeight: 1.8, marginBottom: 20 }} {...props} />,
  ul: (props) => <ul style={{ paddingLeft: 24, marginBottom: 20 }} {...props} />,
  ol: (props) => <ol style={{ paddingLeft: 24, marginBottom: 20 }} {...props} />,
  li: (props) => <li style={{ fontSize: 15, color: '#4a5568', lineHeight: 1.8, marginBottom: 8 }} {...props} />,
  strong: (props) => <strong style={{ color: '#0f1729', fontWeight: 700 }} {...props} />,
  blockquote: (props) => <blockquote style={{ borderLeft: '3px solid #1e3a6e', paddingLeft: 20, margin: '28px 0', color: '#1e3a6e', fontStyle: 'italic', fontSize: 16 }} {...props} />,
  hr: () => <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.08)', margin: '40px 0' }} />,
  a: (props) => <a style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }} {...props} />,
  code: (props) => <code style={{ background: 'rgba(30,58,110,0.08)', color: '#1e3a6e', padding: '2px 6px', borderRadius: 4, fontSize: 13, fontFamily: 'monospace' }} {...props} />,
}

export default function ArticlePage({ params }) {
  const article = getArticleBySlug(params.slug)
  if (!article) notFound()

  const allArticles = getAllArticles()
  const related = allArticles.filter(a => a.slug !== params.slug && a.category === article.category).slice(0, 3)

  // JSON-LD pour Google
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    author: { '@type': 'Organization', name: 'Alma.+' },
    publisher: {
      '@type': 'Organization',
      name: 'Alma.+',
      logo: { '@type': 'ImageObject', url: 'https://alma-plus.fr/logo.png' }
    },
  }

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#fff', minHeight: '100vh' }}>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* NAV */}
      <nav style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '0 52px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: '#1e3a6e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 14 14" fill="none" width="13" height="13"><path d="M2 12L7 2L12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 8.5H10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </div>
          <span style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 800, fontSize: 15, color: '#0f1729', letterSpacing: '-0.5px' }}>Alma<span style={{ color: '#1e3a6e' }}>.</span>+</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/blog" style={{ fontSize: 13, color: '#4a5568', textDecoration: 'none' }}>← Blog</Link>
          <Link href="/login" style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: '#1e3a6e', textDecoration: 'none', padding: '9px 20px', borderRadius: 7 }}>Démarrer gratuit →</Link>
        </div>
      </nav>

      {/* HERO ARTICLE */}
      <section style={{ background: '#f7f8fa', padding: '64px 52px 48px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Link href="/blog" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>Blog</Link>
            <span style={{ color: '#e4e8f0' }}>/</span>
            {article.category && <span style={{ fontSize: 11, fontWeight: 700, color: '#1e3a6e', background: 'rgba(30,58,110,0.08)', padding: '3px 10px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{article.category}</span>}
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{article.readTime}</span>
          </div>
          <h1 style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-2px', color: '#0f1729', marginBottom: 16, lineHeight: 1.1 }}>{article.title}</h1>
          <p style={{ fontSize: 17, color: '#4a5568', lineHeight: 1.7, marginBottom: 24 }}>{article.description}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: '#94a3b8' }}>
            <span>Alma.+ · {new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </section>

      {/* CONTENU */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '56px 52px 80px' }}>
        <MDXRemote source={article.content} components={mdxComponents} />

        {/* CTA inline */}
        <div style={{ background: '#1e3a6e', borderRadius: 16, padding: '32px 36px', marginTop: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Passez à l'action maintenant.</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>7 jours gratuits · Opérationnel en 5 minutes.</div>
          </div>
          <Link href="/login" style={{ flexShrink: 0, background: '#fff', color: '#1e3a6e', fontSize: 13, fontWeight: 800, padding: '12px 22px', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Démarrer gratuitement →
          </Link>
        </div>
      </section>

      {/* ARTICLES LIÉS */}
      {related.length > 0 && (
        <section style={{ background: '#f7f8fa', padding: '64px 52px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', color: '#0f1729', marginBottom: 28 }}>Articles similaires</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {related.map(a => (
                <Link key={a.slug} href={`/blog/${a.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: '20px', transition: 'all 0.15s' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#1e3a6e', background: 'rgba(30,58,110,0.08)', padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', display: 'inline-block', marginBottom: 10 }}>{a.category}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f1729', marginBottom: 6, lineHeight: 1.3 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 600 }}>Lire →</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer style={{ background: '#152d57', padding: '32px 52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 800, fontSize: 14, color: '#fff' }}>Alma<span style={{ color: 'rgba(255,255,255,0.4)' }}>.</span>+</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>© 2026 Alma.+ · Tous droits réservés</span>
      </footer>

    </main>
  )
}
