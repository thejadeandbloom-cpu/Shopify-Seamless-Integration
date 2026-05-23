import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import LeadCapturePopup from "@/components/LeadCapturePopup";
import FaqButton from "@/components/FaqButton";
import Home from "@/pages/Home";
import AdminRefunds from "@/pages/AdminRefunds";

const queryClient = new QueryClient();

function Router() {
  const path = window.location.pathname;
  if (path === "/admin/refunds" || path.endsWith("/admin/refunds")) {
    return <AdminRefunds />;
  }
  return (
    <>
      <Header />
      <CartDrawer />
      <LeadCapturePopup />
      <FaqButton />
      <main>
        <Home />
      </main>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Router />
          <Toaster />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
