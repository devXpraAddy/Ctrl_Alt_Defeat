import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "./pages/not-found";
import AuthPage from "./pages/auth-page";
import HomePage from "./pages/home-page";
import DoctorPage from "./pages/doctor-page";
import AppointmentsPage from "./pages/appointments-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { GoogleMapsProvider } from "@/lib/GoogleMapsProvider";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route 
        path="/" 
        component={() => <ProtectedRoute path="/" component={HomePage} />} 
      />
      <Route 
        path="/doctor/:id" 
        component={() => <ProtectedRoute path="/doctor/:id" component={DoctorPage} />} 
      />
      <Route 
        path="/appointments" 
        component={() => <ProtectedRoute path="/appointments" component={AppointmentsPage} />} 
      />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GoogleMapsProvider>
          <Router />
          <Toaster />
        </GoogleMapsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;