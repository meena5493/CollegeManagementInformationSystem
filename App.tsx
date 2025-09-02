import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/protected-route";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Students from "@/pages/students";
import Marks from "@/pages/marks";
import Courses from "@/pages/courses";
import Fees from "@/pages/fees";
import Faculty from "@/pages/faculty";
import Reports from "@/pages/reports";
import ForgotPassword from "./pages/forgot-password";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/students">
        <ProtectedRoute requiredRole="admin">
          <Students />
        </ProtectedRoute>
      </Route>
      <Route path="/marks">
        <ProtectedRoute>
          <Marks />
        </ProtectedRoute>
      </Route>
      <Route path="/courses">
        <ProtectedRoute>
          <Courses />
        </ProtectedRoute>
      </Route>
      <Route path="/fees">
        <ProtectedRoute>
          <Fees />
        </ProtectedRoute>
      </Route>
      <Route path="/faculty">
        <ProtectedRoute requiredRole="admin">
          <Faculty />
        </ProtectedRoute>
      </Route>
      <Route path="/reports">
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      </Route>
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
