import { Metadata } from 'next'
import AsteroidDetailClient from './AsteroidDetailClient'

interface AsteroidPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: AsteroidPageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Asteroid ${id} Details | NEOWatch`,
    description: `Detailed information about asteroid ${id} including orbital data, size, and potential impact risk.`,
  }
}

export default async function AsteroidPage({ params }: AsteroidPageProps) {
  const { id } = await params
  return <AsteroidDetailClient asteroidId={id} />
}
