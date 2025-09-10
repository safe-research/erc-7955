import "@mantine/core/styles.css";

import { createTheme, MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Status } from "$status/components/Status.tsx";

const root = document.getElementById("root");
if (root && !root.innerHTML) {
  const theme = createTheme({});
  const client = new QueryClient();

  createRoot(root).render(
    <StrictMode>
      <MantineProvider defaultColorScheme="auto" theme={theme}>
        <QueryClientProvider client={client}>
          <Status />
        </QueryClientProvider>
      </MantineProvider>
    </StrictMode>,
  );
}
