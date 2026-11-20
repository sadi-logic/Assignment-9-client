import type { Metadata } from "next"

import { DashboardProfilePage } from "@/components/dashboard/profile-page"

export const metadata: Metadata = {
  title: "My Profile",
  description: "Update your SalonBook customer profile.",
}

export default function CustomerProfileRoute() {
  return <DashboardProfilePage role="customer" />
}
