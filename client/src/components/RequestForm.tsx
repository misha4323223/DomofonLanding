import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function RequestForm() {
  const [formHeight, setFormHeight] = useState({ mobile: 1000, desktop: 950 });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Google Form embedded URL
  const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLScSO3weGn0GU23qVuIXFoARSsra0B2sYFjMEAuDsD6UNQd2_w/viewform?embedded=true";

  useEffect(() => {
    let loadCount = 0;

    // Слушаем postMessage от Google Forms
    const handleMessage = (event: MessageEvent) => {
      console.log('📨 Получено сообщение:', event.origin, event.data);
      
      if (event.origin === 'https://docs.google.com') {
        if (event.data && typeof event.data === 'object') {
          if (event.data.height && event.data.height < 400) {
            console.log('✅ Форма отправлена! Меняю высоту на 150px');
            setIsSubmitted(true);
            setFormHeight({ mobile: 150, desktop: 150 });
          }
        }
      }
    };

    // Обработчик загрузки iframe
    const handleIframeLoad = () => {
      loadCount++;
      console.log(`🔄 Iframe загружен (${loadCount} раз)`);
      
      // После второй загрузки (первая - начальная, вторая - после отправки)
      if (loadCount === 2) {
        setTimeout(() => {
          console.log('✅ Обнаружена отправка формы! Меняю высоту на 150px');
          setIsSubmitted(true);
          setFormHeight({ mobile: 150, desktop: 150 });
        }, 1000);
      }
    };

    window.addEventListener('message', handleMessage);
    
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad);
      }
    };
  }, []);

  return (
    <section className="py-20 bg-background" id="request-form">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4" data-testid="text-form-title">
            Заявка на обслуживание
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-form-subtitle">
            Заполните форму ниже, и мы свяжемся с вами.
          </p>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-muted/30 p-6 border-b">
              <p className="text-sm text-muted-foreground text-center">
                📝 Пожалуйста, укажите: город, адрес, номер дома, квартиру и ваш телефон
              </p>
            </div>
            
            {/* Google Form */}
            <div 
              className="relative bg-card transition-all duration-500"
              style={{ 
                height: `${formHeight.mobile}px`,
              }}
            >
              <style>{`
                @media (min-width: 768px) {
                  .form-container {
                    height: ${formHeight.desktop}px !important;
                  }
                }
              `}</style>
              <div className="form-container w-full h-full">
                <iframe
                  ref={iframeRef}
                  src={googleFormUrl}
                  width="100%"
                  frameBorder="0"
                  marginHeight={0}
                  marginWidth={0}
                  scrolling="no"
                  className="w-full h-full"
                  title="Форма заявки"
                  data-testid="iframe-google-form"
                >
                  Загрузка…
                </iframe>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Или свяжитесь с нами напрямую: <span className="font-medium text-foreground">8-905-629-87-08 / 8-919-073-61-42</span>
          </p>
        </div>
      </div>
    </section>
  );
}
