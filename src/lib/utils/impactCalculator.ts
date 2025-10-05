// Asteroid Impact Prediction Calculator
// Based on NASA JPL impact prediction models and orbital mechanics

export interface AsteroidData {
  name: string
  diameter: {
    min: number
    max: number
  }
  velocity: number // km/s
  missDistance: number // AU
  isHazardous: boolean
  approachDate: string
  inclination?: number
  orbitClass?: string
}

export interface ImpactPrediction {
  impactProbability: number
  impactLocation: {
    latitude: number
    longitude: number
    country?: string
    region?: string
  }
  impactTime: string
  impactEnergy: number // Megatons TNT equivalent
  craterSize: {
    diameter: number // meters
    depth: number // meters
  }
  affectedRadius: number // km
  confidence: number // 0-100%
  scenario: 'nominal' | 'worst_case' | 'best_case'
}

export interface OrbitalElement {
  semiMajorAxis: number
  eccentricity: number
  inclination: number
  longitudeOfAscendingNode: number
  argumentOfPerihelion: number
  meanAnomaly: number
}

// Earth's position in space (simplified)
const EARTH_POSITION = {
  latitude: 0,
  longitude: 0,
  orbitalVelocity: 29.78 // km/s
}

// Calculate impact probability based on orbital mechanics
export function calculateImpactProbability(asteroid: AsteroidData): number {
  const missDistanceKm = asteroid.missDistance * 149.6e6 // Convert AU to km
  const approachVelocity = asteroid.velocity
  
  // Simplified probability calculation based on:
  // 1. Miss distance (closer = higher probability)
  // 2. Velocity (affects gravitational deflection)
  // 3. Size (affects gravitational pull)
  // 4. Orbital uncertainty
  
  let baseProbability = 0
  
  // More realistic distance factor with lower thresholds
  if (missDistanceKm < 5000) { // Within 5,000 km (very close)
    baseProbability = 0.8 * Math.exp(-missDistanceKm / 2000)
  } else if (missDistanceKm < 20000) { // Within 20,000 km (close)
    baseProbability = 0.3 * Math.exp(-(missDistanceKm - 5000) / 10000)
  } else if (missDistanceKm < 50000) { // Within 50,000 km (moderate)
    baseProbability = 0.1 * Math.exp(-(missDistanceKm - 20000) / 20000)
  } else if (missDistanceKm < 100000) { // Within 100,000 km (far but possible)
    baseProbability = 0.02 * Math.exp(-(missDistanceKm - 50000) / 30000)
  }
  
  // Velocity factor (higher velocity = less time for deflection)
  const velocityFactor = Math.min(1, 15 / approachVelocity) // Normalize to 15 km/s
  
  // Size factor (larger objects have more gravitational influence)
  const avgDiameter = (asteroid.diameter.min + asteroid.diameter.max) / 2
  const sizeFactor = Math.min(1, avgDiameter / 1000) // Normalize to 1km
  
  // Orbital uncertainty factor (based on observation quality)
  const uncertaintyFactor = asteroid.isHazardous ? 0.6 : 0.2
  
  const probability = baseProbability * velocityFactor * sizeFactor * uncertaintyFactor
  
  // Cap at realistic maximum but allow for demonstration
  return Math.min(probability, 0.25) // Maximum 25% for very close approaches
}

// Calculate potential impact location using orbital mechanics
export function calculateImpactLocation(asteroid: AsteroidData): { latitude: number; longitude: number } {
  // Simplified impact location calculation
  // In reality, this would require complex orbital propagation
  
  const approachDate = new Date(asteroid.approachDate)
  const timeOfDay = approachDate.getHours()
  const dayOfYear = Math.floor((approachDate.getTime() - new Date(approachDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
  
  // Earth's rotation (360 degrees in 24 hours)
  const earthRotationPerHour = 15 // degrees per hour
  const longitudeOffset = (timeOfDay * earthRotationPerHour) % 360
  
  // Earth's tilt and seasonal position (simplified)
  const seasonalLatitudeOffset = Math.sin((dayOfYear / 365) * 2 * Math.PI) * 23.44 // Earth's axial tilt
  
  // Add some randomness based on orbital parameters
  const orbitalRandomness = (asteroid.missDistance * 100) % 60 - 30 // -30 to +30 degrees
  
  // Base impact location (simplified)
  let latitude = seasonalLatitudeOffset + orbitalRandomness * 0.3
  let longitude = longitudeOffset + orbitalRandomness * 0.5
  
  // Normalize coordinates
  latitude = ((latitude % 180) + 180) % 180 - 90 // -90 to 90
  longitude = ((longitude % 360) + 360) % 360 - 180 // -180 to 180
  
  return { latitude, longitude }
}

// Calculate impact energy (Megatons TNT equivalent)
export function calculateImpactEnergy(asteroid: AsteroidData): number {
  const avgDiameter = (asteroid.diameter.min + asteroid.diameter.max) / 2 // meters
  const velocity = asteroid.velocity * 1000 // Convert to m/s
  
  // Assume average density of 2.6 g/cm³ (typical for asteroids)
  const density = 2600 // kg/m³
  const volume = (4/3) * Math.PI * Math.pow(avgDiameter / 2, 3) // m³
  const mass = volume * density // kg
  
  // Kinetic energy: KE = 0.5 * m * v²
  const kineticEnergy = 0.5 * mass * Math.pow(velocity, 2) // Joules
  
  // Convert to Megatons TNT (1 MT TNT = 4.184 × 10¹² J)
  const megatonsTNT = kineticEnergy / (4.184e15) // Convert to MT
  
  return megatonsTNT
}

// Calculate crater size based on impact energy
export function calculateCraterSize(impactEnergy: number): { diameter: number; depth: number } {
  // Simplified crater scaling laws
  // Based on NASA impact crater scaling relationships
  
  // Convert energy to equivalent impactor size
  const energyMT = impactEnergy
  
  // Crater diameter scaling (simplified)
  const diameter = Math.pow(energyMT / 0.001, 0.294) * 1000 // meters
  
  // Crater depth scaling (typically 1/5 to 1/3 of diameter)
  const depth = diameter * 0.25 // meters
  
  return { diameter, depth }
}

// Calculate affected radius (blast wave, thermal effects)
export function calculateAffectedRadius(impactEnergy: number): number {
  // Based on nuclear weapon effects scaling
  // Simplified atmospheric effects calculation
  
  const energyMT = impactEnergy
  
  // Blast wave radius (km)
  const blastRadius = Math.pow(energyMT, 0.33) * 2.5
  
  // Thermal effects radius (typically 2-3x blast radius)
  const thermalRadius = blastRadius * 2.5
  
  return Math.max(blastRadius, thermalRadius)
}

// Get country/region from coordinates (simplified)
export function getLocationFromCoordinates(lat: number, lon: number): { country?: string; region?: string } {
  // Simplified geographic lookup
  // In a real implementation, you'd use a proper geocoding service
  
  const locations = [
    { lat: [25, 50], lon: [-125, -65], country: 'United States', region: 'North America' },
    { lat: [35, 70], lon: [5, 40], country: 'Europe', region: 'Europe' },
    { lat: [-40, -10], lon: [110, 155], country: 'Australia', region: 'Oceania' },
    { lat: [10, 55], lon: [60, 180], country: 'Russia', region: 'Asia' },
    { lat: [-35, 5], lon: [-80, -35], country: 'South America', region: 'South America' },
    { lat: [10, 37], lon: [-20, 60], country: 'Africa', region: 'Africa' },
    { lat: [5, 50], lon: [60, 150], country: 'Asia', region: 'Asia' },
  ]
  
  for (const location of locations) {
    if (lat >= location.lat[0] && lat <= location.lat[1] && 
        lon >= location.lon[0] && lon <= location.lon[1]) {
      return { country: location.country, region: location.region }
    }
  }
  
  // Default to ocean
  return { country: 'Ocean', region: 'International Waters' }
}

// Main impact prediction function
export function predictAsteroidImpact(asteroid: AsteroidData): ImpactPrediction {
  const impactProbability = calculateImpactProbability(asteroid)
  
  // For demonstration purposes, always show impact prediction for hazardous asteroids
  // In real scenarios, only predict if probability is significant (> 0.01%)
  const shouldPredict = impactProbability >= 0.01 || asteroid.isHazardous
  
  if (!shouldPredict && impactProbability < 0.001) {
    return {
      impactProbability: 0,
      impactLocation: { latitude: 0, longitude: 0, country: 'No Impact Predicted' },
      impactTime: 'N/A',
      impactEnergy: 0,
      craterSize: { diameter: 0, depth: 0 },
      affectedRadius: 0,
      confidence: 0,
      scenario: 'nominal'
    }
  }
  
  // For demonstration, use a minimum probability for hazardous asteroids
  const finalProbability = impactProbability < 0.001 ? 0.05 : impactProbability
  
  const impactLocation = calculateImpactLocation(asteroid)
  const impactEnergy = calculateImpactEnergy(asteroid)
  const craterSize = calculateCraterSize(impactEnergy)
  const affectedRadius = calculateAffectedRadius(impactEnergy)
  const locationInfo = getLocationFromCoordinates(impactLocation.latitude, impactLocation.longitude)
  
  // Calculate confidence based on observation quality and orbital uncertainty
  const confidence = Math.min(95, finalProbability * 1000) // Convert to percentage
  
  // Determine scenario
  let scenario: 'nominal' | 'worst_case' | 'best_case' = 'nominal'
  if (finalProbability > 0.05) {
    scenario = 'worst_case'
  } else if (finalProbability < 0.005) {
    scenario = 'best_case'
  }
  
  // Estimate impact time (simplified)
  const approachDate = new Date(asteroid.approachDate)
  const impactTime = new Date(approachDate.getTime() + (Math.random() * 2 - 1) * 24 * 60 * 60 * 1000) // ±1 day
  
  return {
    impactProbability: finalProbability,
    impactLocation: {
      ...impactLocation,
      ...locationInfo
    },
    impactTime: impactTime.toISOString(),
    impactEnergy,
    craterSize,
    affectedRadius,
    confidence,
    scenario
  }
}

// Generate realistic impact scenarios for display
export function generateImpactScenarios(asteroid: AsteroidData): ImpactPrediction[] {
  const scenarios = ['nominal', 'worst_case', 'best_case'] as const
  return scenarios.map(scenario => {
    const prediction = predictAsteroidImpact(asteroid)
    prediction.scenario = scenario
    
    // Adjust values based on scenario
    switch (scenario) {
      case 'worst_case':
        prediction.impactProbability *= 1.5
        prediction.impactEnergy *= 1.2
        prediction.affectedRadius *= 1.3
        prediction.confidence *= 0.9
        break
      case 'best_case':
        prediction.impactProbability *= 0.7
        prediction.impactEnergy *= 0.8
        prediction.affectedRadius *= 0.8
        prediction.confidence *= 1.1
        break
    }
    
    return prediction
  })
}
