import type { Metadata } from 'next'

export const metadata: Metadata = {
  manifest: '/manifest.json'
}

export default function PadresLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
