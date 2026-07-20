import type Lenis from 'lenis';

declare global {
  interface Window {
    __hydrallmLenis?: Lenis;
    __hydrallmNestedLenisCount?: number;
  }
}

export {};
