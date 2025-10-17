import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { requestFormSchema, type RequestFormData } from "@shared/schema";
import { Loader2, CheckCircle2, FileText, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { oneSignalService } from "@/lib/onesignal";
import { supabaseAPI } from "@/lib/supabase";

export function RequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [submittedData, setSubmittedData] = useState<RequestFormData | null>(null);
  const [savedRequestId, setSavedRequestId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      city: "",
      address: "",
      apartment: "",
      message: "",
    },
  });

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);
    try {
      // Сохраняем в Supabase
      console.log('💾 Сохраняем заявку в Supabase:', data);
      const savedRequest = await supabaseAPI.createRequest(data);
      console.log('✅ Заявка сохранена в Supabase:', savedRequest);

      if (savedRequest && savedRequest.id) {
        setSavedRequestId(savedRequest.id.toString());
      }

      console.log('✅ Форма отправлена успешно');

      setSubmittedData(data);
      setIsSubmitted(true);
      setShowNotificationPrompt(true);
      console.log('👉 Показываем промпт подписки');

      form.reset();

      toast({
        title: "Заявка отправлена!",
        description: "Мы свяжемся с вами в ближайшее время.",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Ошибка отправки",
        description: "Не удалось отправить форму. Пожалуйста, попробуйте позже.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnableNotifications = async () => {
    setIsSubscribing(true);
    try {
      console.log('🔔 Запрашиваем разрешение на уведомления...');

      // Проверяем, доступен ли OneSignal
      if (typeof window.OneSignalDeferred === 'undefined') {
        throw new Error('OneSignal SDK не загружен. Возможно, он заблокирован браузером.');
      }

      await oneSignalService.requestPermission();

      // Сохраняем данные клиента в теги OneSignal
      if (!submittedData) {
        throw new Error('Данные формы не найдены');
      }

      console.log('💾 Сохраняем данные клиента в теги:', submittedData);

      if (submittedData.phone) {
        await oneSignalService.addTag('phone', submittedData.phone);
      }
      if (submittedData.name) {
        await oneSignalService.addTag('name', submittedData.name);
      }
      if (submittedData.city) {
        await oneSignalService.addTag('city', submittedData.city);
      }
      if (submittedData.address) {
        await oneSignalService.addTag('address', submittedData.address);
      }

      console.log('✅ Теги сохранены успешно');

      // Получаем OneSignal subscription ID и обновляем в Supabase
      console.log('🔍 Получаем OneSignal Subscription ID...');
      const subscriptionId = await oneSignalService.getSubscriptionId();
      
      if (subscriptionId) {
        console.log('✅ OneSignal ID получен:', subscriptionId);
        
        if (savedRequestId) {
          console.log('💾 Сохраняем OneSignal ID в Supabase для заявки:', savedRequestId);
          await supabaseAPI.updateRequestOneSignalId(savedRequestId, subscriptionId);
          console.log('✅ OneSignal ID успешно сохранен в Supabase!');
        } else {
          console.warn('⚠️ Request ID не найден, не могу сохранить OneSignal ID');
        }
      } else {
        console.warn('⚠️ OneSignal ID не получен. Возможно, пользователь отклонил разрешение на уведомления');
      }

      toast({
        title: "Уведомления включены!",
        description: "Вы будете получать обновления о статусе заявки",
      });
      setShowNotificationPrompt(false);
    } catch (error: any) {
      console.error('❌ Failed to enable notifications:', error);

      let errorTitle = "Ошибка";
      let errorMessage = "Не удалось включить уведомления";

      if (error?.message?.includes('заблокирован') || error?.message?.includes('blocked') || error?.message?.includes('не загружен')) {
        errorTitle = "Уведомления заблокированы";
        errorMessage = "Пожалуйста, отключите блокировщик рекламы или защиту от отслеживания для этого сайта";
      }

      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorMessage,
        duration: 6000,
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="py-20 bg-background" id="request-form">
        <div className="max-w-4xl mx-auto px-6">
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" data-testid="icon-success" />
              <h2 className="text-2xl font-bold mb-2" data-testid="text-success-title">
                Заявка отправлена!
              </h2>
              <p className="text-muted-foreground mb-6" data-testid="text-success-message">
                Спасибо! Мы свяжемся с вами в ближайшее время.
              </p>

              {showNotificationPrompt && (
                <Card className="mb-6 border-primary/20 bg-primary/5">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <Bell className="w-6 h-6 text-primary" />
                      <h3 className="text-lg font-semibold">Получайте уведомления</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Мы сообщим вам когда мастер выедет к вам и когда работа будет завершена
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={handleEnableNotifications}
                        disabled={isSubscribing}
                        data-testid="button-enable-notifications"
                      >
                        {isSubscribing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Включение...
                          </>
                        ) : (
                          <>
                            <Bell className="mr-2 h-4 w-4" />
                            Включить уведомления
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setShowNotificationPrompt(false)}
                        data-testid="button-skip-notifications"
                      >
                        Пропустить
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button
                onClick={() => {
                  setIsSubmitted(false);
                  setShowNotificationPrompt(false);
                  setSavedRequestId(null);
                }}
                data-testid="button-submit-another"
              >
                Отправить ещё одну заявку
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

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

        <Card>
          <CardContent className="p-6">
            <div className="bg-muted/30 p-4 rounded-md mb-6 flex items-center justify-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                Укажите: город, адрес, номер дома, квартиру и ваш телефон
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Имя *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ваше имя"
                            {...field}
                            data-testid="input-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Телефон *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+7 (___) ___-__-__"
                            {...field}
                            data-testid="input-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Город *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Например: Москва"
                            {...field}
                            data-testid="input-city"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apartment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Квартира</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Номер квартиры"
                            {...field}
                            data-testid="input-apartment"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Адрес *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Улица, дом"
                          {...field}
                          data-testid="input-address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Комментарий</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Опишите проблему или дополнительную информацию..."
                          className="resize-none min-h-[120px]"
                          {...field}
                          data-testid="input-message"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                  data-testid="button-submit-form"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    "Отправить заявку"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground" data-testid="text-contact-info">
            Или свяжитесь с нами напрямую:{" "}
            <span className="font-medium text-foreground">
              8-905-629-87-08 / 8-919-073-61-42
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}