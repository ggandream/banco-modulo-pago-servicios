import { ClientProvider } from "./Client/client.provider";
import { MantineAppProvider } from "./Mantine/mantine.provider";
import { AppRouterProvider } from "./Router/router.provider";

export function AppProviders() {
  return (
    <MantineAppProvider>
      <ClientProvider>
        <AppRouterProvider />
      </ClientProvider>
    </MantineAppProvider>
  );
}
