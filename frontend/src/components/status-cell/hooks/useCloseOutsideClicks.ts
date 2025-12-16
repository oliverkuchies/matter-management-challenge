import { useEffect } from "react";

interface UseCloseOutsideClicksProps {
    dropdownRef: React.RefObject<HTMLDivElement>;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

/**
 * Hook to close a dropdown when clicking outside of it.
 */
export function useCloseOutsideClicks({
    dropdownRef,
    isOpen,
    setIsOpen,
} : UseCloseOutsideClicksProps) {
      useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
          }
        };
    
        if (isOpen) {
          document.addEventListener('mousedown', handleClickOutside);
        }
    
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }, [isOpen]);
    
}