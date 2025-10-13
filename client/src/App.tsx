import { useEffect } from "react";
import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import { oneSignalService } from "@/lib/onesignal";

const basePath = import.meta.env.BASE_URL || "/";
const ONESIGNAL_APP_ID = '3a40bd59-5a8b-40a1-ba68-59676525befb';

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    const initOneSignal = async () => {
      try {
        await oneSignalService.initialize({ appId: ONESIGNAL_APP_ID });
        console.log('OneSignal initialized successfully');
      } catch (error) {
        console.error('Failed to initialize OneSignal:', error);
      }
    };

    initOneSignal();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router base={basePath}>
          <AppRouter />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
