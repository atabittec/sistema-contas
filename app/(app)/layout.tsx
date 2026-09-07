import { verifySession } from "@/lib/auth";
import { AppSidebar, MobileTopBar } from "@/components/AppSidebar";
import { logout } from "./logout-action";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();

  return (
    <div className="flex min-h-screen">
      <AppSidebar userName={session.name} logoutAction={logout} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar userName={session.name} logoutAction={logout} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
