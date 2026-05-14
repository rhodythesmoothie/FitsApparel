"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </NextThemesProvider>
      <ToastProvider
        placement="top-center"
        toastOffset={24}
        toastProps={{
          radius: "sm",
          shadow: "lg",
          timeout: 2600,
          variant: "flat",
          shouldShowTimeoutProgress: true,
          classNames: {
            base: "border border-black/10 bg-white text-black",
            title: "font-semibold",
            description: "text-black/70",
          },
        }}
      />
    </HeroUIProvider>
  );
}
