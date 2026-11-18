import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { DashboardSidebar } from "../components/DashboardSidebar";

/**
 * Dashboard shell: role-aware sidebar on the left, content on the right.
 *
 * The site header lives in the root layout and stays sticky above this shell,
 * so the provider fills the remaining viewport instead of forcing its own
 * `min-h-svh`. `min-w-0` on the inset keeps long page content from widening the
 * sidebar column.
 */
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider className="min-h-0 flex-1">
      <DashboardSidebar />

      <SidebarInset className="min-w-0">
        <header className="flex h-14 items-center gap-3 border-b border-border/70 px-4 sm:px-6">
          <SidebarTrigger className="-ml-1.5 text-muted-foreground hover:text-brand-plum" />
          <span aria-hidden className="h-4 w-px bg-border" />
          <p className="text-[0.6rem] font-medium tracking-[0.3em] text-muted-foreground uppercase">
            Salon dashboard
          </p>
        </header>

        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
