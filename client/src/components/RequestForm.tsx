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

  const onSubmit = (values: RequestFormData) => {
    console.log('✅ Заявка готова к отправке');

    // Сохраняем данные формы
    setSubmittedData(values);
    console.log('🔍 setSubmittedData вызван');

    // Показываем модалку с предложением включить уведомления ПЕРЕД отправкой в базу
    setShowNotificationPrompt(true);
    console.log('🔍 setShowNotificationPrompt вызван, значение должно быть true');
  };

  // Обработчик включения уведомлений
  async function handleEnableNotifications() {
    if (!submittedData) {
      console.error('❌ Нет данных формы');
      return;
    }

    try {
      setIsSubscribing(true); // Renamed from setIsEnablingNotifications for consistency
      console.log('🔔 Начинаем процесс включения уведомления...');

      // Проверяем, доступен ли OneSignal
      if (typeof window.OneSignalDeferred === 'undefined') {
        throw new Error('OneSignal SDK не загружен. Возможно, он заблокирован браузером.');
      }

      console.log('📋 Запрашиваем разрешение на уведомления...');
      await oneSignalService.requestPermission();

      console.log('✅ Разрешение получено, ждем создания подписки...');

      // Ждем создания подписки
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Получаем OneSignal subscription ID
      console.log('🔍 Получаем OneSignal Subscription ID...');
      const subscriptionId = await oneSignalService.getSubscriptionId();

      console.log('🏷️ Сохраняем теги клиента в OneSignal...');
      await oneSignalService.addTag('name', submittedData.name);
      await oneSignalService.addTag('phone', submittedData.phone);
      await oneSignalService.addTag('city', submittedData.city);
      await oneSignalService.addTag('address', submittedData.address);

      if (submittedData.message) {
        await oneSignalService.addTag('message', submittedData.message);
      }

      console.log('✅ Теги сохранены');

      // ТЕПЕРЬ отправляем заявку в Supabase С OneSignal ID
      console.log('📤 Отправляем заявку в базу данных С OneSignal ID...');
      setIsSubmitting(true);

      const createdRequest = await supabaseAPI.createRequest({
        ...submittedData,
        onesignal_id: subscriptionId || null,
      });

      if (!createdRequest) {
        throw new Error('Не удалось создать заявку');
      }

      console.log('✅ Заявка создана с OneSignal ID:', createdRequest);

      if (createdRequest && createdRequest.id) {
        setSavedRequestId(createdRequest.id.toString());
      }

      setIsSubmitted(true);
      setShowNotificationPrompt(false); // Close the prompt after successful submission
      setIsSubmitting(false);

      toast({
        title: "Заявка отправлена!",
        description: "Вы будете получать уведомления о статусе вашей заявки.",
      });

      form.reset();

    } catch (error: any) {
      console.error('❌ Failed to enable notifications:', error);

      let errorTitle = "Ошибка";
      let errorMessage = "Не удалось включить уведомления";

      if (error?.message?.includes('заблокирован') || error?.message?.includes('blocked') || error?.message?.includes('не загружен')) {
        errorTitle = "Уведомления заблокированы";
        errorMessage = "Пожалуйста, отключите блокировщик рекламы или защиту от отслеживания для этого сайта";
      } else if (error.message) {
        errorMessage = error.message;
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
  }

  // Обработчик пропуска уведомлений
  async function handleSkipNotifications() {
    if (!submittedData) {
      setShowNotificationPrompt(false);
      return;
    }

    try {
      console.log('⏭️ Пользователь отказался от уведомлений, отправляем заявку БЕЗ OneSignal ID...');

      // Отправляем заявку БЕЗ OneSignal ID
      setIsSubmitting(true);
      const createdRequest = await supabaseAPI.createRequest({
        ...submittedData,
        onesignal_id: null,
      });

      if (!createdRequest) {
        throw new Error('Не удалось создать заявку');
      }

      console.log('✅ Заявка создана без OneSignal ID:', createdRequest);

      if (createdRequest && createdRequest.id) {
        setSavedRequestId(createdRequest.id.toString());
      }

      setShowNotificationPrompt(false);
      setSubmittedData(null);
      setIsSubmitted(true); // Mark as submitted
      setIsSubmitting(false);

      toast({
        title: "Заявка отправлена",
        description: "Мы свяжемся с вами в ближайшее время.",
      });

      form.reset();

    } catch (error) {
      console.error('❌ Ошибка при отправке заявки:', error);

      toast({
        title: "Ошибка",
        description: "Не удалось отправить заявку. Попробуйте еще раз.",
        variant: "destructive",
      });
    }
  }

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

              <Button
                onClick={() => {
                  setIsSubmitted(false);
                  setShowNotificationPrompt(false);
                  setSavedRequestId(null);
                  setSubmittedData(null);
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

        {showNotificationPrompt && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Bell className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold">Получайте уведомления о статусе заявки</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 text-center">
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
                  onClick={handleSkipNotifications}
                  data-testid="button-skip-notifications"
                >
                  Пропустить
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
                            placeholder="Например: Новомосковск"
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