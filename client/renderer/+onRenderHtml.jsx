import { renderToString } from 'react-dom/server'
import { Router } from 'wouter'
import '../src/index.css'

export default async function onRenderHtml(pageContext) {
  const { Page, urlPathname } = pageContext
  
  const pageHtml = renderToString(
    <Router ssrPath={urlPathname}>
      <Page />
    </Router>
  )

  const documentHtml = `<!DOCTYPE html>
    <html lang="ru">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
        
        <!-- Content Security Policy для OneSignal и Formspree -->
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.onesignal.com https://api.onesignal.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://onesignal.com https://*.onesignal.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: http:; connect-src 'self' https://onesignal.com https://*.onesignal.com https://formspree.io https://*.supabase.co; worker-src 'self' blob:; frame-src 'self' https://onesignal.com https://*.onesignal.com https://cdn.onesignal.com https://os.tc https://*.os.tc;" />
        
        <!-- SEO Meta Tags -->
        <title>Установка и ремонт домофонов в Тульской области | Домофонная служба ИП Бухтеев</title>
        <meta name="description" content="⚡ Установка и ремонт домофонов в Тульской области от 3000₽! Выезд за 48-72 часа. Гарантия 12 месяцев. Тула, Новомосковск, Узловая, Алексин. Видео и аудио домофоны. Звоните: 8-905-629-87-08" />
        <meta name="keywords" content="установка домофонов Тула, ремонт домофонов Тула цена, установка домофона Новомосковск, ремонт домофона Узловая, видеодомофон установка Тульская область, IP домофон Тула, домофонная система для квартиры, установка домофона в частном доме Тула, аудиодомофон установка, многоквартирный домофон, срочный ремонт домофона, диагностика домофона Тула, замена домофона Алексин, настройка домофонной системы" />
        <meta name="author" content="ИП Бухтеев" />
        
        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.obzor71.ru/" />
        <meta property="og:title" content="Установка и ремонт домофонов в Тульской области | ИП Бухтеев" />
        <meta property="og:description" content="⚡ Установка и ремонт домофонов в Тульской области от 3000₽! Выезд за 48-72 часа. Гарантия 12 месяцев. Тула, Новомосковск, Узловая, Алексин. Звоните: 8-905-629-87-08" />
        <meta property="og:image" content="https://www.obzor71.ru/og-image.jpg" />
        
        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://www.obzor71.ru/" />
        <meta property="twitter:title" content="Установка и ремонт домофонов в Тульской области | ИП Бухтеев" />
        <meta property="twitter:description" content="⚡ Установка и ремонт домофонов в Тульской области от 3000₽! Выезд за 48-72 часа. Гарантия 12 месяцев. Звоните: 8-905-629-87-08" />
        <meta property="twitter:image" content="https://www.obzor71.ru/og-image.jpg" />
        
        <!-- Canonical URL -->
        <link rel="canonical" href="https://www.obzor71.ru/" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        
        <!-- OneSignal Push Notifications -->
        <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
        <script>
          window.OneSignalDeferred = window.OneSignalDeferred || [];
          OneSignalDeferred.push(async function(OneSignal) {
            await OneSignal.init({
              appId: "3a40bd59-5a8b-40a1-ba68-59676525befb",
              allowLocalhostAsSecureOrigin: true,
            });
            console.log('✅ OneSignal инициализирован');
          });
        </script>
      </head>
      <body>
        <div id="root">${pageHtml}</div>
        
        <!-- Schema.org Structured Data (JSON-LD) - LocalBusiness -->
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
          "areaServed": [
            {
              "@type": "City",
              "name": "Тула"
            },
            {
              "@type": "City",
              "name": "Новомосковск"
            },
            {
              "@type": "City",
              "name": "Узловая"
            },
            {
              "@type": "City",
              "name": "Алексин"
            },
            {
              "@type": "City",
              "name": "Щекино"
            }
          ],
          "priceRange": "3000-15000 RUB",
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
                  "description": "Профессиональная установка домофонных систем любой сложности: видеодомофоны, аудиодомофоны, IP-домофоны, многоквартирные системы",
                  "provider": {
                    "@type": "LocalBusiness",
                    "name": "Домофонная служба ИП Бухтеев"
                  },
                  "areaServed": "Тульская область"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Ремонт домофонов",
                  "description": "Диагностика неисправностей, замена компонентов, настройка системы, профилактика. Устранение проблем от 48 до 72 часов",
                  "provider": {
                    "@type": "LocalBusiness",
                    "name": "Домофонная служба ИП Бухтеев"
                  },
                  "areaServed": "Тульская область"
                }
              }
            ]
          }
        }
        </script>
        
        <!-- Schema.org Structured Data (JSON-LD) - Service для установки -->
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": "Установка домофонов",
          "provider": {
            "@type": "LocalBusiness",
            "name": "Домофонная служба ИП Бухтеев",
            "telephone": "+7-905-629-87-08"
          },
          "areaServed": {
            "@type": "State",
            "name": "Тульская область"
          },
          "offers": {
            "@type": "Offer",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "price": "3000",
              "priceCurrency": "RUB",
              "name": "от"
            }
          },
          "description": "Установка видеодомофонов, аудиодомофонов, IP-домофонов и многоквартирных систем в Тульской области. Выезд мастера от 48 до 72 часов."
        }
        </script>
        
        <!-- Schema.org Structured Data (JSON-LD) - Service для ремонта -->
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": "Ремонт домофонов",
          "provider": {
            "@type": "LocalBusiness",
            "name": "Домофонная служба ИП Бухтеев",
            "telephone": "+7-905-629-87-08"
          },
          "areaServed": {
            "@type": "State",
            "name": "Тульская область"
          },
          "offers": {
            "@type": "Offer",
            "availability": "https://schema.org/InStock"
          },
          "description": "Ремонт и обслуживание домофонных систем: диагностика неисправностей, замена компонентов, настройка, профилактика. Гарантия 12 месяцев."
        }
        </script>
        
        <!-- Schema.org Structured Data (JSON-LD) - FAQPage -->
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Сколько стоит установка домофона?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Стоимость установки домофона зависит от типа системы и сложности работ. Цены начинаются от 3000₽ за базовую установку аудиодомофона. Видеодомофоны и IP-системы могут стоить от 5000₽ до 15000₽. Для точной оценки позвоните по телефону 8-905-629-87-08."
              }
            },
            {
              "@type": "Question",
              "name": "Как быстро вы приедете для установки или ремонта?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Выезд мастера на установку или ремонт домофона осуществляется от 48 до 72 часов после оставления заявки. В срочных случаях возможен более быстрый выезд - уточняйте по телефону."
              }
            },
            {
              "@type": "Question",
              "name": "Какую гарантию вы даёте на работы?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Мы предоставляем гарантию 12 месяцев на все выполненные работы по установке и ремонту домофонных систем. Используем только проверенное оборудование."
              }
            },
            {
              "@type": "Question",
              "name": "В каких городах Тульской области вы работаете?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Мы оказываем услуги по установке и ремонту домофонов в следующих городах Тульской области: Тула, Новомосковск, Узловая, Алексин, Щекино и других населенных пунктах региона. Зона обслуживания - радиус 50 км."
              }
            },
            {
              "@type": "Question",
              "name": "Какие типы домофонов вы устанавливаете?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Мы устанавливаем все типы домофонных систем: видеодомофоны, аудиодомофоны, IP-домофоны и многоквартирные системы. Работаем как с частными домами, так и с многоквартирными зданиями."
              }
            },
            {
              "@type": "Question",
              "name": "Что делать если домофон не открывает дверь?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Если домофон не открывает дверь, сначала проверьте батарейки в трубке. Если это не помогло, проблема может быть в электромагнитном замке, блоке питания или панели вызова. Рекомендуем обратиться к специалистам для диагностики. Звоните: 8-905-629-87-08."
              }
            }
          ]
        }
        </script>
      </body>
    </html>`

  return {
    documentHtml,
    pageContext: {
      urlPathname
    }
  }
}
