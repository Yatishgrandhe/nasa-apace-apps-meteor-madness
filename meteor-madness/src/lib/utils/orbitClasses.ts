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
  'Main Belt': {
    name: 'Main Belt',
    description: 'Asteroids located in the main asteroid belt between Mars and Jupiter.',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    riskLevel: 'Low'
  },
  'Trojan': {
    name: 'Trojan',
    description: 'Asteroids that share an orbit with a planet, located at stable Lagrange points.',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/20',
    riskLevel: 'Low'
  },
  'Centaur': {
    name: 'Centaur',
    description: 'Small Solar System bodies with orbits between Jupiter and Neptune.',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/20',
    riskLevel: 'Low'
  },
  'Trans-Neptunian': {
    name: 'Trans-Neptunian',
    description: 'Objects with orbits beyond Neptune, including Kuiper Belt and scattered disc objects.',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
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
  // Map JPL codes to our orbit class names
  const jplCodeMapping: Record<string, string> = {
    'APO': 'Apollo',
    'ATE': 'Aten', 
    'AMO': 'Amor',
    'ATI': 'Atira',
    'LPC': 'Long Period',
    'SPC': 'Short Period',
    'HTC': 'Halley-type',
    'JFC': 'Jupiter Family'
  }
  
  // Ensure orbitClass is a string and handle null/undefined values
  if (!orbitClass || typeof orbitClass !== 'string') {
    return ORBIT_CLASSES['Unknown']
  }
  
  const normalizedClass = orbitClass.toUpperCase()
  
  // Check JPL code mappings first
  if (jplCodeMapping[normalizedClass]) {
    const mappedName = jplCodeMapping[normalizedClass]
    if (ORBIT_CLASSES[mappedName]) {
      return ORBIT_CLASSES[mappedName]
    }
  }
  
  // Handle various formats and cases
  const formattedClass = orbitClass
    ?.replace(/[^a-zA-Z\s]/g, '') // Remove special characters
    ?.trim()
    ?.split(' ')
    ?.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    ?.join(' ') || 'Unknown'

  // Direct match
  if (ORBIT_CLASSES[formattedClass]) {
    return ORBIT_CLASSES[formattedClass]
  }

  // Partial matches
  const matches = Object.keys(ORBIT_CLASSES).filter(key => 
    key.toLowerCase().includes(formattedClass.toLowerCase()) ||
    formattedClass.toLowerCase().includes(key.toLowerCase())
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
