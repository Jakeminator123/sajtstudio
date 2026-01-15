'use client'

import { useEffect, useCallback, useState } from 'react'

interface ModalState<TData extends Record<string, unknown>> {
  isOpen: boolean
  modalId: string | null
  data?: TData
}

export function useModalManager<TData extends Record<string, unknown> = Record<string, unknown>>() {
  const [modalState, setModalState] = useState<ModalState<TData>>({
    isOpen: false,
    modalId: null,
    data: undefined,
  })

  // Define modal functions first so they can be used in useEffect
  const openModal = useCallback((modalId: string, data?: TData) => {
    setModalState({
      isOpen: true,
      modalId,
      data,
    })
  }, [])

  const closeModal = useCallback(() => {
    setModalState({
      isOpen: false,
      modalId: null,
      data: undefined,
    })
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalState.isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }

    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }
  }, [modalState.isOpen])

  // ESC key listener
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalState.isOpen) {
        closeModal()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [modalState.isOpen, closeModal])

  const isModalOpen = useCallback(
    (modalId: string) => {
      return modalState.isOpen && modalState.modalId === modalId
    },
    [modalState]
  )

  return {
    isOpen: modalState.isOpen,
    modalId: modalState.modalId,
    data: modalState.data,
    openModal,
    closeModal,
    isModalOpen,
  }
}
