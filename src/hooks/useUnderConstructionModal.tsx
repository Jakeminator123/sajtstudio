'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import UnderConstructionModal from '@/components/modals/UnderConstructionModal'

interface UnderConstructionModalContextType {
  openModal: () => void
  closeModal: () => void
  isOpen: boolean
}

const UnderConstructionModalContext = createContext<UnderConstructionModalContextType | null>(null)

export function UnderConstructionModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return (
    <UnderConstructionModalContext.Provider value={{ openModal, closeModal, isOpen }}>
      {children}
      <UnderConstructionModal isOpen={isOpen} onClose={closeModal} />
    </UnderConstructionModalContext.Provider>
  )
}

export function useUnderConstructionModal() {
  const context = useContext(UnderConstructionModalContext)
  if (!context) {
    throw new Error('useUnderConstructionModal must be used within UnderConstructionModalProvider')
  }
  return context
}
