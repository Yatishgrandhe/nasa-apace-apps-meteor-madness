import type { Metadata } from "next";
import Navigation from '@/components/Navigation'
import DashboardClient from './DashboardClient'

export const metadata: Metadata = {
  title: "Dashboard | NEOWatch",
  description: "Comprehensive overview of space threats and monitoring data"
};

export default function DashboardPage() {
  // No user authentication required
  return (
    <>
      <Navigation />
      <DashboardClient />
    </>
  )
}
