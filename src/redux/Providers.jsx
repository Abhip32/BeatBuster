"use client";

import React, { useState } from "react";
import { Provider } from "react-redux";
import { store, persistor } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes fresh data (no refetching if visited recently)
            gcTime: 30 * 60 * 1000, // 30 minutes in memory cache
            refetchOnWindowFocus: false, // Don't trigger refetch on tab switch
            retry: 1, // Single retry on network blip
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {children}
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  );
}
