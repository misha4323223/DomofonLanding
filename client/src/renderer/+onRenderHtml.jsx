export { onRenderHtml }

import { renderToString } from 'react-dom/server'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'
import '../index.css'

async function onRenderHtml(pageContext) {
  const { Page } = pageContext
  
  const pageHtml = renderToString(<Page />)

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="ru">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
        
        <!-- SEO Meta Tags -->
        <title>Установка и ремонт домофонов в Тульской области | Домофонная служба ИП Бухтеев</title>
        <meta name="description" content="Профессиональная установка и ремонт домофонных систем в Тульской области. Выезд от 48 до 72 часов. Гарантия качества. Оставьте заявку онлайн или позвоните 8-905-629-87-08" />
        <meta name="keywords" content="установка домофонов, ремонт домофонов, домофонная служба, домофоны Тульская область, установка домофона Тульская область, ремонт домофона Тульская область" />
        <meta name="author" content="ИП Бухтеев" />
        
        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.obzor71.ru/" />
        <meta property="og:title" content="Установка и ремонт домофонов в Тульской области | ИП Бухтеев" />
        <meta property="og:description" content="Профессиональная установка и ремонт домофонных систем в Тульской области. Выезд от 48 до 72 часов. Оставьте заявку онлайн!" />
        <meta property="og:image" content="https://www.obzor71.ru/og-image.jpg" />
        
        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://www.obzor71.ru/" />
        <meta property="twitter:title" content="Установка и ремонт домофонов в Тульской области | ИП Бухтеев" />
        <meta property="twitter:description" content="Профессиональная установка и ремонт домофонных систем в Тульской области. Выезд от 48 до 72 часов." />
        <meta property="twitter:image" content="https://www.obzor71.ru/og-image.jpg" />
        
        <!-- Canonical URL -->
        <link rel="canonical" href="https://www.obzor71.ru/" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      </head>
      <body>
        <div id="root">${dangerouslySkipEscape(pageHtml)}</div>
        
        <!-- Schema.org Structured Data (JSON-LD) -->
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Домофонная служба ИП Бухтеев",
          "url": "https://www.obzor71.ru",
          "image": "https://www.obzor71.ru/og-image.jpg",
          "description": "Профессиональная установка и ремонт домофонных систем в Тульской области",
          "address": {
            "@type": "PostalAddress",
            "addressRegion": "Тульская область",
            "addressCountry": "RU"
          },
          "telephone": ["+7-905-629-87-08", "+7-919-073-61-42"],
          "areaServed": {
            "@type": "GeoCircle",
            "geoMidpoint": {
              "@type": "GeoCoordinates",
              "latitude": "54.193122",
              "longitude": "37.617348"
            },
            "geoRadius": "50000"
          },
          "priceRange": "$$",
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              "opens": "09:00",
              "closes": "18:00"
            }
          ],
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Услуги домофонной службы",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Установка домофонов",
                  "description": "Профессиональная установка домофонных систем любой сложности"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Ремонт домофонов",
                  "description": "Устранение проблем и неисправностей домофонных систем от 48 до 72 часов"
                }
              }
            ]
          }
        }
        </script>
      </body>
    </html>`

  return {
    documentHtml,
    pageContext: {}
  }
}
