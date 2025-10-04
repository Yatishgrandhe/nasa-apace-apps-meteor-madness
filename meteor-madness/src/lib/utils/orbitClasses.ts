export interface OrbitClassInfo {
  name: string
  description: string
  color: string
  bgColor: string
  riskLevel: 'Low' | 'Medium' | 'High'
}

export const ORBIT_CLASSES: Record<string, OrbitClassInfo> = {
  'Apollo': {
    name: 'Apollo',
    description: 'Earth-crossing asteroids with semi-major axis > 1 AU. Most dangerous type.',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    riskLevel: 'High'
  },
  'Aten': {
    name: 'Aten',
    description: 'Earth-crossing asteroids with semi-major axis < 1 AU. Cross Earth\'s orbit.',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    riskLevel: 'High'
  },
  'Amor': {
    name: 'Amor',
    description: 'Near-Earth asteroids that approach Earth\'s orbit but do not cross it.',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    riskLevel: 'Medium'
  },
  'Atira': {
    name: 'Atira',
    description: 'Asteroids with orbits entirely within Earth\'s orbit. Also called Interior Earth Objects.',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    riskLevel: 'Medium'
  },
  'Long Period': {
    name: 'Long Period',
    description: 'Comets with orbital periods > 200 years. Originate from the Oort Cloud.',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    riskLevel: 'Low'
  },
  'Short Period': {
    name: 'Short Period',
    description: 'Comets with orbital periods < 200 years. Originate from the Kuiper Belt.',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    riskLevel: 'Low'
  },
  'Halley-type': {
    name: 'Halley-type',
    description: 'Comets with orbital periods 20-200 years. Highly inclined orbits.',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    riskLevel: 'Medium'
  },
  'Jupiter Family': {
    name: 'Jupiter Family',
    description: 'Short-period comets with orbital periods < 20 years. Influenced by Jupiter.',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/20',
    riskLevel: 'Low'
  },
  'Unknown': {
    name: 'Unknown',
    description: 'Orbit classification not yet determined or insufficient data.',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    riskLevel: 'Low'
  }
}

export function getOrbitClassInfo(orbitClass: string): OrbitClassInfo {
  // Handle various formats and cases
  const normalizedClass = orbitClass
    .replace(/[^a-zA-Z\s]/g, '') // Remove special characters
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  // Direct match
  if (ORBIT_CLASSES[normalizedClass]) {
    return ORBIT_CLASSES[normalizedClass]
  }

  // Partial matches
  const matches = Object.keys(ORBIT_CLASSES).filter(key => 
    key.toLowerCase().includes(normalizedClass.toLowerCase()) ||
    normalizedClass.toLowerCase().includes(key.toLowerCase())
  )

  if (matches.length > 0) {
    return ORBIT_CLASSES[matches[0]]
  }

  // Default to Unknown
  return ORBIT_CLASSES['Unknown']
}

export function getOrbitClassColor(orbitClass: string): string {
  return getOrbitClassInfo(orbitClass).color
}

export function getOrbitClassBgColor(orbitClass: string): string {
  return getOrbitClassInfo(orbitClass).bgColor
}

export function getOrbitClassDescription(orbitClass: string): string {
  return getOrbitClassInfo(orbitClass).description
}

export function getRiskLevelColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'High':
      return 'text-red-400'
    case 'Medium':
      return 'text-yellow-400'
    case 'Low':
      return 'text-green-400'
    default:
      return 'text-gray-400'
  }
}
