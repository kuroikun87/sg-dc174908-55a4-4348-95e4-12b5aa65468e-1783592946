import { useEffect } from "react";
import { useRouter } from "next/router";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";

function AppRoutes({ Component, pageProps }: { Component: any; pageProps: any }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const publicPaths = ["/", "/onboarding"];
    const isPublic = publicPaths.includes(router.pathname);

    // Solo proteger rutas privadas: si no hay usuario y la ruta es privada, redirigir a /
    if (!user && !isPublic) {
      router.replace("/");
    }
  }, [user, isLoading, router.pathname]);

  return <Component {...pageProps} />;
}

export default function App({ Component, pageProps }: { Component: any; pageProps: any }) {
  return (
    <AuthProvider>
      <AppRoutes Component={Component} pageProps={pageProps} />
      <Toaster />
    </AuthProvider>
  );
}