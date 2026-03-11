"use client";

import { usePathname } from "next/navigation";
import NavFootLayout from "./NavFootLayout";
import LenisProvider from "./LenisProvider";
import MediaKitProvider from "./MediaKitProvider";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminOrAuth =
    pathname.startsWith("/admin") || pathname === "/login";

  if (isAdminOrAuth) {
    return <>{children}</>;
  }

  return (
    <LenisProvider>
      <MediaKitProvider>
        <NavFootLayout>{children}</NavFootLayout>
      </MediaKitProvider>
    </LenisProvider>
  );
}
