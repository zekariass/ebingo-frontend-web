import { ReactNode, Suspense } from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from '@/components/theme-provider'
import '@/app/globals.css'
import QueryProvider from '@/providers/QueryProvider'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { Analytics } from '@vercel/analytics/next'
import { I18nProvider } from '@/providers/I18nProvider'

interface LayoutProps {
  children: ReactNode
  // params: { locale: string }
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js?59"></script>
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<h1>Loading...</h1>}>
          <I18nProvider fallbackLocale="en">
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false} storageKey="bingo-theme">
              <QueryProvider>
                <div className="flex justify-end">
                  <LanguageSwitcher />
                </div>

                {children}
              </QueryProvider>
            </ThemeProvider>
          </I18nProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
