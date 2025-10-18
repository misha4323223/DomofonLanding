import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { requestFormSchema, type RequestFormData } from "@shared/schema";
import { Loader2, CheckCircle2, FileText, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { oneSignalService } from "@/lib/onesignal";
import { supabaseAPI } from "@/lib/supabase";

export function RequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
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
      enableNotifications: true,
    },
  });

  const onSubmit = async (values: RequestFormData) => {
    setIsSubmitting(true);

    let oneSignalId: string | undefined = undefined;

    if (values.enableNotifications) {
      console.log('🔔 Пользователь хочет получать уведомления');

      try {
        if (typeof window.OneSignalDeferred === 'undefined') {
          console.warn('⚠️ OneSignal SDK не загружен (возможно заблокирован)');
          toast({
            title: "Уведомления недоступны",
            description: "OneSignal заблокирован блокировщиком рекламы. Заявка будет отправлена, но уведомления не придут.",
            duration: 5000,
          });
        } else {
          console.log('📋 Запрашиваем разрешение на уведомления...');
          await oneSignalService.requestPermission();

          console.log('⏳ Ждем создания подписки...');
          await new Promise(resolve => setTimeout(resolve, 1000));

          console.log('🔍 Получаем OneSignal Subscription ID...');
          const subscriptionId = await oneSignalService.getSubscriptionId();

          if (subscriptionId) {
            console.log('🏷️ Сохраняем теги клиента в OneSignal...');
            await oneSignalService.addTag('name', values.name);
            await oneSignalService.addTag('phone', values.phone);
            await oneSignalService.addTag('city', values.city);
            await oneSignalService.addTag('address', values.address);

            if (values.message) {
              await oneSignalService.addTag('message', values.message);
            }

            oneSignalId = subscriptionId;
            console.log('✅ OneSignal ID получен:', oneSignalId);
          } else {
            console.log('⚠️ Не удалось получить OneSignal ID, отправляем без него');
          }
        }
      } catch (error) {
        console.error('⚠️ Ошибка при настройке уведомлений:', error);
        toast({
          title: "Уведомления не настроены",
          description: "Не удалось настроить уведомления, но заявка будет отправлена.",
          duration: 4000,
        });
      }
    } else {
      console.log('⏭️ Пользователь отказался от уведомлений');
    }

    try {

      console.log('📤 Отправляем заявку в базу данных...');
      const createdRequest = await supabaseAPI.createRequest({
        name: values.name,
        phone: values.phone,
        city: values.city,
        address: values.address,
        apartment: values.apartment,
        message: values.message,
        onesignal_id: oneSignalId,
      });

      if (!createdRequest) {
        throw new Error('Не удалось создать заявку');
      }

      console.log('✅ Заявка создана:', createdRequest);

      setIsSubmitted(true);

      if (oneSignalId) {
        toast({
          title: "Заявка отправлена!",
          description: "Вы будете получать уведомления о статусе вашей заявки.",
        });
      } else {
        toast({
          title: "Заявка отправлена",
          description: "Мы свяжемся с вами в ближайшее время.",
        });
      }

      form.reset();

    } catch (error: any) {
      console.error('❌ Ошибка при отправке заявки:', error);

      let errorTitle = "Ошибка";
      let errorMessage = "Не удалось отправить заявку. Попробуйте еще раз.";

      if (error?.message?.includes('заблокирован') || error?.message?.includes('blocked') || error?.message?.includes('не загружен')) {
        errorTitle = "Уведомления заблокированы";
        errorMessage = "Заявка не отправлена. Пожалуйста, отключите блокировщик рекламы или разрешите уведомления.";
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
      setIsSubmitting(false);
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

              <Button
                onClick={() => setIsSubmitted(false)}
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

                <FormField
                  control={form.control}
                  name="enableNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-primary/20 bg-primary/5 p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-notifications"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center gap-2 text-base font-medium cursor-pointer">
                          <Bell className="w-4 h-4" />
                          Получать уведомления о статусе заявки
                        </FormLabel>
                        <FormDescription className="text-sm">
                          Мы сообщим вам когда мастер выедет к вам и когда работа будет завершена
                        </FormDescription>
                      </div>
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
