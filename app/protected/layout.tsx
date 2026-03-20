import { HeaderNav } from "@/components/header-nav";
import { ReactQueryProvider } from "@/lib/query-client";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactQueryProvider>
      <div className="flex min-h-screen flex-col">
        <HeaderNav />
        <main className="mx-auto w-full max-w-5xl flex-1 p-4">{children}</main>
      </div>
    </ReactQueryProvider>
  );
}
