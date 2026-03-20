import { HeaderNav } from "@/components/header-nav";
import { ReactQueryProvider } from "@/lib/query-client";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email ?? "";

  return (
    <ReactQueryProvider>
      <div className="flex min-h-screen flex-col">
        <HeaderNav email={email} />
        <main className="mx-auto w-full max-w-5xl flex-1 p-4">{children}</main>
      </div>
    </ReactQueryProvider>
  );
}
