import { Metadata } from 'next'
import AsteroidDetailClient from './AsteroidDetailClient'

interface AsteroidPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: AsteroidPageProps): Promise<Metadata> {
  return {
    title: `Asteroid ${params.id} Details | NEOWatch`,
    description: `Detailed information about asteroid ${params.id} including orbital data, size, and potential impact risk.`,
  }
}

export default function AsteroidPage({ params }: AsteroidPageProps) {
  return <AsteroidDetailClient asteroidId={params.id} />
}
