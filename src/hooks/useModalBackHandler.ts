import { useEffect, useRef } from 'react';

/**
 * Custom hook to handle mobile browser back button (popstate) and Escape key
 * when a floating overlay / modal / drawer is opened.
 * Prevents native phone back button from exiting the web app, and instead closes the active modal!
 */
export function useModalBackHandler(
  isOpen: boolean,
  onClose: () => void,
  modalId: string = 'modal'
) {
  const isPushedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      if (isPushedRef.current) {
        isPushedRef.current = false;
        // If closed manually via close button or backdrop click, clean up history state if present
        if (window.history.state && window.history.state[modalId]) {
          try {
            window.history.back();
          } catch (e) {
            // Ignore if back state fails
          }
        }
      }
      return;
    }

    // Modal was opened: push a history state entry so back button closes it
    try {
      const stateObj = { ...(window.history.state || {}), [modalId]: true };
      window.history.pushState(stateObj, '');
      isPushedRef.current = true;
    } catch (e) {
      // Ignore if pushState fails in iframe context
    }

    const handlePopState = () => {
      // User pressed native browser/phone back button!
      isPushedRef.current = false;
      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, modalId]);
}
