'use client'

import { ReactNode } from 'react'
import { UnderConstructionModalProvider } from '@/hooks/useUnderConstructionModal'
import { OfferModalProvider } from '@/hooks/useOfferModal'

interface ProvidersProps {
  children: ReactNode
}

/**
 * Providers Component
 *
 * Wraps the app with all client-side context providers.
 * This allows us to keep the root layout as a server component
 * while still providing global client-side state.
 */
export default function Providers({ children }: ProvidersProps) {
  return (
    <UnderConstructionModalProvider>
      <OfferModalProvider>{children}</OfferModalProvider>
    </UnderConstructionModalProvider>
  )
}
