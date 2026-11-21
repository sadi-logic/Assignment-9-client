import {
  CalendarCheckIcon,
  CalendarDaysIcon,
  LayoutDashboardIcon,
  PlusCircleIcon,
  ReceiptTextIcon,
  ScissorsIcon,
  UserRoundIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import type { UserRole } from "@/lib/roles"
import { routes } from "@/lib/site"

export type MenuItem = {
  /** Label shown in the sidebar. */
  name: string
  /** Destination route. */
  url: string
  /** Lucide icon rendered before the label. */
  icon: LucideIcon
}


export const menuItemsByRole: Record<UserRole, MenuItem[]> = {
  customer: [
    {
      name: "Overview",
      url: routes.customerDashboard,
      icon: LayoutDashboardIcon,
    },
    {
      name: "My Appointments",
      url: routes.customerAppointments,
      icon: CalendarDaysIcon,
    },
    {
      name: "My Profile",
      url: routes.customerProfile,
      icon: UserRoundIcon,
    },
  ],
  admin: [
    {
      name: "Overview",
      url: routes.adminDashboard,
      icon: LayoutDashboardIcon,
    },
    {
      name: "Manage Services",
      url: routes.adminServices,
      icon: ScissorsIcon,
    },
    {
      name: "Add/Update Service",
      url: routes.adminServiceAdd,
      icon: PlusCircleIcon,
    },
    {
      name: "Manage Appointments",
      url: routes.adminAppointments,
      icon: CalendarCheckIcon,
    },
    {
      name: "Manage Users",
      url: routes.adminUsers,
      icon: UsersIcon,
    },
    {
      name: "Transactions",
      url: routes.adminTransactions,
      icon: ReceiptTextIcon,
    },
    {
      name: "My Profile",
      url: routes.adminProfile,
      icon: UserRoundIcon,
    },
  ],
}
