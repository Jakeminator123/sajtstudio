"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import OfferModal from "@/components/modals/OfferModal";

interface OfferModalContextType {
  openModal: () => void;
  closeModal: () => void;
  isOpen: boolean;
}

const OfferModalContext = createContext<OfferModalContextType | null>(null);

export function OfferModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <OfferModalContext.Provider value={{ openModal, closeModal, isOpen }}>
      {children}
      <OfferModal isOpen={isOpen} onClose={closeModal} />
    </OfferModalContext.Provider>
  );
}

export function useOfferModal() {
  const context = useContext(OfferModalContext);
  if (!context) {
    throw new Error("useOfferModal must be used within OfferModalProvider");
  }
  return context;
}

