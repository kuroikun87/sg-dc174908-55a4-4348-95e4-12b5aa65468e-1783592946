import { Html, Head, Main, NextScript } from 'next/document'
import { SEOElements } from '@/components/SEO'

export default function Document() {
  return (
    <Html lang="es" suppressHydrationWarning>
      <Head>
        <SEOElements
          title="Códice Oscuro — Grimorio Ritual BDSM"
          description="Grimorio ritual para quienes abrazan la oscuridad y encuentran poder en la entrega consensuada. Gestión de cultos, jerarquías y dinámicas D/s."
          image="/og-image.png"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
