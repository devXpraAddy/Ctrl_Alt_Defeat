import { createContext, useContext, ReactNode } from 'react';
import { useJsApiLoader, type Libraries } from '@react-google-maps/api';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from "lucide-react";

interface GoogleMapsContextType {
  isLoaded: boolean;
  apiKeyLoaded: boolean;
}

interface ConfigResponse {
  googleMapsApiKey: string;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | null>(null);

// Define libraries outside component to prevent recreation
const libraries: Libraries = ["places", "geometry"];

// Single loader instance configuration
const loaderConfig = {
  libraries,
  version: "weekly",
  id: 'google-maps-script'
};

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  // Fetch the API key configuration
  const { data: config, isLoading: isConfigLoading, isError } = useQuery<ConfigResponse>({
    queryKey: ["/api/config"],
    staleTime: Infinity, // Prevent unnecessary refetches
    retry: 3, // Retry failed requests up to 3 times
  });

  // Initialize loader only once with the API key
  const { isLoaded } = useJsApiLoader({
    ...loaderConfig,
    googleMapsApiKey: config?.googleMapsApiKey ?? ''
  });

  // Show loading state while fetching configuration
  if (isConfigLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] bg-muted">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mt-4">Loading Maps Configuration...</span>
      </div>
    );
  }

  // Show error state if config fetch fails
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] bg-muted text-destructive">
        <span>Failed to load maps configuration</span>
      </div>
    );
  }

  // Provide the context to children
  return (
    <GoogleMapsContext.Provider value={{ 
      isLoaded, 
      apiKeyLoaded: Boolean(config?.googleMapsApiKey)
    }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
}