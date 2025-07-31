import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

const locales = ["en","fr","es","it","tr"]
const defaultLocale = 'en'

export default getRequestConfig(async ({ locale }: { locale?: string }) => {
  // if locale is missing, use defaultLocale
  const code = locale ?? defaultLocale

  if (!locales.includes(code)) {
    notFound()
  }

  return {
    locale: code,
    messages: (await import(`../messages/${code}.json`)).default
  }
})
