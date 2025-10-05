import Navigation from '@/components/Navigation'
import DashboardClient from './DashboardClient'

export default function DashboardPage() {
  // No user authentication required
  return (
    <>
      <Navigation />
      <DashboardClient />
    </>
  )
}
