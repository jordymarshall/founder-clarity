import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "@/components/auth/protected-route";
import Deconstruct from "./pages/Deconstruct";
import Evidence from "./pages/Evidence";
import Discovery from "./pages/Discovery";
import Synthesis from "./pages/Synthesis";
import Research from "./pages/Research";
import Validation from "./pages/Validation";
import Settings from "./pages/Settings";
import Design from "./pages/Design";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />

            {/* Idea-agnostic (legacy) routes */}
            <Route path="/deconstruct" element={<ProtectedRoute><Deconstruct /></ProtectedRoute>} />
            <Route path="/evidence" element={<ProtectedRoute><Evidence /></ProtectedRoute>} />
            <Route path="/discovery" element={<ProtectedRoute><Discovery /></ProtectedRoute>} />
            <Route path="/synthesis" element={<ProtectedRoute><Synthesis /></ProtectedRoute>} />

            {/* Idea-scoped workflow routes */}
            <Route path="/ideas/:ideaSlug/deconstruct" element={<ProtectedRoute><Deconstruct /></ProtectedRoute>} />
            <Route path="/ideas/:ideaSlug/evidence" element={<ProtectedRoute><Evidence /></ProtectedRoute>} />
            <Route path="/ideas/:ideaSlug/discovery" element={<ProtectedRoute><Discovery /></ProtectedRoute>} />
            <Route path="/ideas/:ideaSlug/synthesis" element={<ProtectedRoute><Synthesis /></ProtectedRoute>} />
            <Route path="/ideas/:ideaSlug/design" element={<ProtectedRoute><Design /></ProtectedRoute>} />

            {/* Other pages */}
            <Route path="/research" element={<ProtectedRoute><Research /></ProtectedRoute>} />
            <Route path="/validation" element={<ProtectedRoute><Validation /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
