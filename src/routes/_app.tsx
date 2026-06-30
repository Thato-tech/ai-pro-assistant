import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar, MobileBottomNav } from "@/components/app-sidebar";
import { CommandPalette } from "@/components/command-palette";
import { IndustryProvider } from "@/lib/industry";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <IndustryProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          <Outlet />
        </main>
        <MobileBottomNav />
        <CommandPalette />
      </div>
    </IndustryProvider>
  );
}
