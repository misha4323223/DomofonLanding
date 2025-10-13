import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      name: "Иван Петров",
      location: "Тула",
      service: "Установка видеодомофона",
      rating: 5,
      text: "Быстро приехали, качественно установили видеодомофон. Всё работает отлично, мастер объяснил как пользоваться. Рекомендую!"
    },
    {
      name: "Мария Соколова",
      location: "Новомосковск",
      service: "Ремонт домофона",
      rating: 5,
      text: "Домофон перестал открывать дверь. Приехали в течение двух дней, быстро нашли проблему и устранили. Цена адекватная, работой довольна."
    },
    {
      name: "Сергей Николаев",
      location: "Узловая",
      service: "Установка IP-домофона",
      rating: 5,
      text: "Установили современный IP-домофон в частный дом. Теперь могу видеть кто пришёл прямо с телефона. Работа выполнена профессионально, спасибо!"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4" data-testid="text-testimonials-title">
            Отзывы наших клиентов
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Нам доверяют жители Тульской области
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="hover-elevate transition-all duration-300"
              data-testid={`card-testimonial-${index}`}
            >
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                <div className="border-t pt-4">
                  <p className="font-semibold" data-testid={`text-testimonial-name-${index}`}>
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.location} • {testimonial.service}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
