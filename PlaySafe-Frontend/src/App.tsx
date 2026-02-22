import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Players from "./pages/Players";
import PlayerProfile from "./pages/PlayerProfile";
import Strategy from "./pages/Strategy";
import Recovery from "./pages/Recovery";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { DemoUserProvider } from "./context/DemoUserContext";

const queryClient = new QueryClient();



const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <DemoUserProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/match" element={<Index />} />
              <Route path="/players" element={<Players />} />
              <Route path="/player/:playerId" element={<PlayerProfile />} />
              <Route path="/strategy" element={<Strategy />} />
              <Route path="/recovery" element={<Recovery />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DemoUserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
