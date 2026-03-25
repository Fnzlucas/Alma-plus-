import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

export function getAllArticles() {
  if (!fs.existsSync(BLOG_DIR)) return []

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'))

  return files
    .map(filename => {
      const slug = filename.replace('.mdx', '')
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8')
      const { data, content } = matter(raw)
      return {
        slug,
        title: data.title || '',
        description: data.description || '',
        date: data.date || '',
        category: data.category || '',
        readTime: readingTime(content).text,
        content,
        ...data,
      }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function getArticleBySlug(slug) {
  const filepath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filepath)) return null
  const raw = fs.readFileSync(filepath, 'utf-8')
  const { data, content } = matter(raw)
  return {
    slug,
    readTime: readingTime(content).text,
    content,
    ...data,
  }
}
