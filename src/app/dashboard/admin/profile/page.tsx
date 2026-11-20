import type { Metadata } from "next"

import { DashboardProfilePage } from "@/components/dashboard/profile-page"

export const metadata: Metadata = {
  title: "My Profile",
  description: "Update your SalonBook administrator profile.",
}

export default function AdminProfileRoute() {
  return <DashboardProfilePage role="admin" />
}
