import { createContext, type ReactNode, useContext } from 'react';
import { type AppServices, createDeviceServices } from '../services/appServices';

const ServicesContext = createContext<AppServices | null>(null);

/** Makes the app's services available to every controller (dependency injection through context). */
export function ServicesProvider({ services, children }: { services: AppServices; children: ReactNode }) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

/** The app's services, for controllers. Views never call services; services never see a view. */
export function useServices(): AppServices {
  const services = useContext(ServicesContext);
  if (!services) throw new Error('useServices must be used inside <ServicesProvider>');
  return services;
}

let configured: AppServices | undefined;

/** The services the app runs with: built once on the device's database (tests replace them). */
export function appServices(): AppServices {
  return (configured ??= createDeviceServices());
}

/** Tests: run the app's routes with these services instead. */
export function setAppServices(services: AppServices | undefined) {
  configured = services;
}
