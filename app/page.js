'use client'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    fetch('/alma-plus-landing.html')
      .then(r => r.text())
      .then(html => {
        document.open()
        document.write(html)
        document.close()
      })
  }, [])
  return null
}
