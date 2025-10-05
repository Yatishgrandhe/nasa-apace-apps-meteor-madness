import type { Metadata } from "next";
import CometDetailClient from './CometDetailClient'
import Navigation from '@/components/Navigation'

interface CometPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: CometPageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Comet ${id} Details | NEOWatch`,
    description: `Detailed information about comet ${id} including orbital data, size, and potential impact risk.`,
  }
}

export default async function CometPage({ params }: CometPageProps) {
  const { id } = await params
  return (
    <>
      <Navigation />
      <CometDetailClient cometId={id} />
    </>
  )
}