import type { Metadata } from "next";
import DashboardClient from './DashboardClient'

export const metadata: Metadata = {
  title: "Dashboard | NEOWatch",
  description: "Comprehensive overview of space threats and monitoring data"
};

export default function DashboardPage() {
  return <DashboardClient />
}
