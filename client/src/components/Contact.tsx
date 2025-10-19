import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function Contact() {
  const contactInfo = [
    {
      icon: Phone,
      title: "Телефон",
      value: "8-905-629-87-08 / 8-919-073-61-42",
      link: "tel:+79056298708"
    },
    {
      icon: Mail,
      title: "Email",
      value: "info@domofon-service.ru",
      link: "mailto:info@domofon-service.ru"
    },
    {
      icon: MapPin,
      title: "Адрес",
      value: "Тульская область",
      link: null
    },
    {
      icon: Clock,
      title: "Режим работы",
      value: "Пн-Пт: 10:00 - 17:00 Сб/Вс выходной",
      link: null
    }
  ];

  return (
    <section className="py-20 bg-muted/30" id="contact">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4" data-testid="text-contact-title">Контакты</h2>
          <p className="text-lg text-muted-foreground" data-testid="text-contact-subtitle">
            Свяжитесь с нами удобным способом
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((item, index) => (
            <div
              key={index}
              className="glass-card glow-border-primary p-6 rounded-md border-0 hover-elevate transition-all duration-300"
              data-testid={`card-contact-${index}`}
            >
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="h-6 w-6 icon-gradient" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              {item.link ? (
                <a 
                  href={item.link} 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  data-testid={`link-contact-${index}`}
                >
                  {item.value}
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">{item.value}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
