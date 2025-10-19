import { Shield, Clock, Award } from "lucide-react";

export function Benefits() {
  const benefits = [
    {
      icon: Shield,
      title: "Гарантия качества",
      description: "Все работы выполняются с последующем обслуживанием. Используем только проверенные оборудования."
    },
    {
      icon: Clock,
      title: "Устранение проблем",
      description: "Выезд мастера на выявление неисправности от 48 до 72 часов."
    },
    {
      icon: Award,
      title: "Работаем официально",
      description: "Заключаем договор и предоставляем акты"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4" data-testid="text-benefits-title">
            Что мы гарантируем
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="glass-card glow-border-primary text-center p-8 rounded-md transition-all duration-300 hover-elevate"
              data-testid={`card-benefit-${index}`}
            >
              <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <benefit.icon className="h-8 w-8 icon-gradient" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
