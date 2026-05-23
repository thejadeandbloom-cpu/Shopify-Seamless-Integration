import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import LeadCapturePopup from "@/components/LeadCapturePopup";
import FaqButton from "@/components/FaqButton";
import Home from "@/pages/Home";
import AdminRefunds from "@/pages/AdminRefunds";
import WriteReview from "@/pages/WriteReview";
import MyOrders from "@/pages/MyOrders";

const queryClient = new QueryClient();

function Router() {
  const path = window.location.pathname;

  if (path === "/admin/refunds" || path.endsWith("/admin/refunds")) {
    return <AdminRefunds />;
  }

  if (path === "/write-review" || path.endsWith("/write-review")) {
    return (
      <>
        <Header minimal />
        <WriteReview />
      </>
    );
  }

  if (path === "/my-orders" || path.endsWith("/my-orders")) {
    return (
      <>
        <Header minimal />
        <MyOrders />
      </>
    );
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
        <CustomerAuthProvider>
          <CartProvider>
            <Router />
            <Toaster />
          </CartProvider>
        </CustomerAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
