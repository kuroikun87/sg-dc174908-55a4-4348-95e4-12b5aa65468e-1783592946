import { useEffect } from "react";
import { useRouter } from "next/router";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";

function AppRoutes({ Component, pageProps }: { Component: any; pageProps: any }) {
  const router = useRouter();
  const { user, isLoading, needsOnboarding } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const publicPaths = ["/", "/onboarding"];
    const isPublic = publicPaths.includes(router.pathname);

    if (!user && !isPublic) {
      router.push("/");
    } else if (user && needsOnboarding && router.pathname !== "/onboarding") {
      router.push("/onboarding");
    } else if (user && !needsOnboarding && isPublic) {
      router.push("/dashboard");
    }
  }, [user, isLoading, needsOnboarding, router]);

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