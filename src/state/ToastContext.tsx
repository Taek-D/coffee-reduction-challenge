import { useToast as useTdsToast } from '@toss/tds-mobile';

interface ToastContextValue {
  showToast: (text: string) => void;
}

export function useToast(): ToastContextValue {
  const { openToast } = useTdsToast();
  return {
    showToast: openToast,
  };
}
