import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Route Optimizer - Efficient Fleet Management",
  description: "Optimize your fleet routes with our advanced route optimization platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

