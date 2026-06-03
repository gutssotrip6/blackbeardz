'use client';

import { CartProvider } from "../context/CartContext";
import { LanguageProvider } from "../context/LanguageContext";
import CartDrawer from "./ui/CartDrawer";
import CheckoutModal from "./ui/CheckoutModal";
import TrackingProvider from "./TrackingProvider";
import StickyHeader from "./ui/StickyHeader";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TrackingProvider />
      <LanguageProvider>
        <CartProvider>
          <StickyHeader />
          {children}
          <CartDrawer />
          <CheckoutModal />
        </CartProvider>
      </LanguageProvider>
    </>
  );
}
