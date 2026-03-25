export const metadata = {
  title: 'Alma.+ — L\'outil de prospection numéro 1 en France',
  description: 'Alma.+ trouve vos prospects, rédige des messages personnalisés et relance automatiquement.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
