import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BarberPole } from "@/components/ui/barber-pole";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Home, Scissors, Calendar, User, Menu, Plus, LogOut } from "lucide-react";

// Pages
import Splash from "@/pages/splash";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Services from "@/pages/services";
import Schedule from "@/pages/schedule";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

type AppState = "splash" | "auth" | "main";

function Navigation() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/services", icon: Scissors, label: "Services" },
    { path: "/schedule", icon: Calendar, label: "Book Appointment" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  const currentPath = location;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <BarberPole size="sm" className="mr-3" />
              <span className="text-2xl font-bold text-primary">BarberPro</span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => setLocation(item.path)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <button className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-secondary"></span>
              </button>

              {/* User Avatar */}
              <div className="relative flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage 
                    src={user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"}
                    alt={`${user?.firstName} ${user?.lastName}`}
                  />
                  <AvatarFallback>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium">
                  {user?.firstName}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="ml-2 hidden sm:flex"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border px-4 py-2 z-40">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center py-2 px-3 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs">{item.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function Router() {
  const [appState, setAppState] = useState<AppState>("splash");
  const [selectedServiceId, setSelectedServiceId] = useState<number | undefined>();
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && appState !== "main") {
      setAppState("main");
    }
  }, [isAuthenticated, appState]);

  const handleSplashComplete = () => {
    setAppState("auth");
  };

  const handleAuthSuccess = () => {
    setAppState("main");
    setLocation("/");
  };

  const handleScheduleService = (serviceId?: number) => {
    setSelectedServiceId(serviceId);
    setLocation("/schedule");
  };

  const handleScheduleSuccess = () => {
    setSelectedServiceId(undefined);
    setLocation("/");
  };

  if (appState === "splash") {
    return <Splash onGetStarted={handleSplashComplete} />;
  }

  if (appState === "auth" || !isAuthenticated) {
    return <Auth onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pb-20 md:pb-0">
        <Switch>
          <Route path="/">
            <Dashboard onSchedule={() => handleScheduleService()} />
          </Route>
          <Route path="/services">
            <Services onBookService={handleScheduleService} />
          </Route>
          <Route path="/schedule">
            <Schedule 
              selectedServiceId={selectedServiceId}
              onSuccess={handleScheduleSuccess}
            />
          </Route>
          <Route path="/profile">
            <Profile />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton 
        onClick={() => handleScheduleService()}
        className="bg-secondary hover:bg-secondary/90"
      >
        <Plus className="w-8 h-8" />
      </FloatingActionButton>

      {/* WhatsApp Button */}
      <WhatsAppButton 
        customerName={user ? `${user.firstName} ${user.lastName}` : ""}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
