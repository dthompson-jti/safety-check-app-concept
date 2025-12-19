import { StrictMode } from 'react';
import { Provider as JotaiProvider } from 'jotai';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <StrictMode>
      <JotaiProvider>{children}</JotaiProvider>
    </StrictMode>
  );
}
