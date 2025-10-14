import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { adminAuthSchema, type AdminAuthData, type OneSignalSubscriber } from "@shared/schema";
import { oneSignalAPI } from "@/lib/onesignal-api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, RefreshCw, CheckCircle, Truck, Clock } from "lucide-react";

const ADMIN_PASSWORD = "admin123";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [subscribers, setSubscribers] = useState<OneSignalSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const { toast } = useToast();

  const authForm = useForm<AdminAuthData>({
    resolver: zodResolver(adminAuthSchema),
    defaultValues: {
      password: "",
    },
  });

  useEffect(() => {
    const savedAuth = localStorage.getItem("admin_auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
      loadSubscribers();
    }
  }, []);

  const loadSubscribers = async () => {
    setIsLoading(true);
    try {
      const data = await oneSignalAPI.getSubscribers();
      // Показываем всех подписчиков, у которых есть хотя бы какие-то теги
      const filtered = data.filter(s => s.tags && Object.keys(s.tags).length > 0);
      setSubscribers(filtered);
      toast({
        title: "Подписчики загружены",
        description: `Найдено: ${filtered.length} подписчиков`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка загрузки",
        description: "Не удалось загрузить список подписчиков",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onLogin = (data: AdminAuthData) => {
    if (data.password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("admin_auth", "true");
      loadSubscribers();
      toast({
        title: "Вход выполнен",
        description: "Добро пожаловать в админ-панель",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Неверный пароль",
        description: "Попробуйте снова",
      });
    }
  };

  const sendNotification = async (subscriber: OneSignalSubscriber, status: string) => {
    setSendingTo(subscriber.id);
    try {
      let heading = "";
      let message = "";

      const name = subscriber.tags?.name || "Клиент";
      const address = subscriber.tags?.address || "указанный адрес";

      switch (status) {
        case "processing":
          heading = "Заявка в обработке";
          message = `${name}, ваша заявка принята в работу. Мы свяжемся с вами в ближайшее время.`;
          break;
        case "departed":
          heading = "Мастер выехал";
          message = `${name}, мастер выехал к вам по адресу: ${address}`;
          break;
        case "solved":
          heading = "Проблема решена";
          message = `${name}, работа завершена. Спасибо за обращение! Как вам наше обслуживание?`;
          break;
      }

      await oneSignalAPI.sendNotification({
        subscriberId: subscriber.id,
        heading,
        message,
      });

      toast({
        title: "Уведомление отправлено",
        description: `${heading} → ${subscriber.tags?.name || subscriber.tags?.phone}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка отправки",
        description: "Не удалось отправить уведомление",
      });
    } finally {
      setSendingTo(null);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_auth");
    setSubscribers([]);
    authForm.reset();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Вход в админ-панель
            </CardTitle>
            <CardDescription>
              Введите пароль для доступа к панели управления уведомлениями
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...authForm}>
              <form onSubmit={authForm.handleSubmit(onLogin)} className="space-y-4">
                <FormField
                  control={authForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Пароль</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Введите пароль"
                          data-testid="input-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" data-testid="button-login">
                  Войти
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Админ-панель</h1>
            <p className="text-sm text-muted-foreground">Управление уведомлениями</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={loadSubscribers}
              disabled={isLoading}
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Обновить
            </Button>
            <Button variant="outline" onClick={logout} data-testid="button-logout">
              Выход
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Список подписчиков ({subscribers.length})</CardTitle>
            <CardDescription>
              Клиенты, которые подписались на уведомления о статусе заявок
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : subscribers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Подписчиков пока нет
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Имя</TableHead>
                      <TableHead>Телефон</TableHead>
                      <TableHead>Город</TableHead>
                      <TableHead>Комментарий</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell className="font-medium" data-testid={`text-name-${subscriber.id}`}>
                          {subscriber.tags?.name || "—"}
                        </TableCell>
                        <TableCell data-testid={`text-phone-${subscriber.id}`}>
                          {subscriber.tags?.phone || "—"}
                        </TableCell>
                        <TableCell data-testid={`text-city-${subscriber.id}`}>
                          {subscriber.tags?.city || "—"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate" data-testid={`text-message-${subscriber.id}`}>
                          {subscriber.tags?.message || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendNotification(subscriber, "processing")}
                              disabled={sendingTo === subscriber.id}
                              data-testid={`button-processing-${subscriber.id}`}
                            >
                              {sendingTo === subscriber.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Clock className="h-3 w-3 mr-1" />
                              )}
                              В обработке
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendNotification(subscriber, "departed")}
                              disabled={sendingTo === subscriber.id}
                              data-testid={`button-departed-${subscriber.id}`}
                            >
                              {sendingTo === subscriber.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Truck className="h-3 w-3 mr-1" />
                              )}
                              Мастер выехал
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendNotification(subscriber, "solved")}
                              disabled={sendingTo === subscriber.id}
                              data-testid={`button-solved-${subscriber.id}`}
                            >
                              {sendingTo === subscriber.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              )}
                              Решена
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
