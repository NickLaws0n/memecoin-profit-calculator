import './globals.css'

export const metadata = {
  title: 'Memecoin Calculator',
  description: 'Calculate your potential memecoin returns',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B1120] text-white min-h-screen">{children}</body>
    </html>
  )
}
