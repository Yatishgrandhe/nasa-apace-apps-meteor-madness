// Orbit Class Calculator
// Determines asteroid orbit classes based on orbital elements when API data is missing

export interface OrbitalElements {
  semiMajorAxis?: number // AU
  eccentricity?: number
  inclination?: number // degrees
  perihelionDistance?: number // AU
  aphelionDistance?: number // AU
  orbitalPeriod?: number // years
  argumentOfPerihelion?: number // degrees
  longitudeOfAscendingNode?: number // degrees
  meanAnomaly?: number // degrees
}

export interface OrbitClassification {
  orbitClass: string
  description: string
  confidence: number // 0-100
  method: 'calculation' | 'api' | 'fallback'
  riskLevel: 'Low' | 'Medium' | 'High'
}

// Calculate orbit class from orbital elements
export function calculateOrbitClass(elements: OrbitalElements, isHazardous?: boolean): OrbitClassification {
  try {
    // Validate required elements
    if (!elements.semiMajorAxis || !elements.eccentricity || !elements.inclination) {
      return getFallbackClassification(isHazardous)
    }

    const a = elements.semiMajorAxis // semi-major axis in AU
    const e = elements.eccentricity
    const i = elements.inclination // inclination in degrees
    const q = elements.perihelionDistance || a * (1 - e) // perihelion distance
    const Q = elements.aphelionDistance || a * (1 + e) // aphelion distance

    // Earth's orbital parameters for reference
    const earthA = 1.0 // AU
    const earthQ = 0.983 // AU (Earth's perihelion)
    const earthQMax = 1.017 // AU (Earth's aphelion)

    // Near-Earth Object classification
    if (Q >= 0.983 && q <= 1.017) {
      // Object crosses Earth's orbit
      if (a > 1.0) {
        return {
          orbitClass: 'Apollo',
          description: 'Earth-crossing asteroid with semi-major axis > 1 AU. Most dangerous type.',
          confidence: 85,
          method: 'calculation',
          riskLevel: 'High'
        }
      } else {
        return {
          orbitClass: 'Aten',
          description: 'Earth-crossing asteroid with semi-major axis < 1 AU. Crosses Earth\'s orbit.',
          confidence: 85,
          method: 'calculation',
          riskLevel: 'High'
        }
      }
    }

    // Amor-type objects (approach but don't cross Earth's orbit)
    if (q > 1.017 && q <= 1.3) {
      return {
        orbitClass: 'Amor',
        description: 'Near-Earth asteroid that approaches Earth\'s orbit but does not cross it.',
        confidence: 80,
        method: 'calculation',
        riskLevel: 'Medium'
      }
    }

    // Atira-type objects (interior to Earth's orbit)
    if (Q < 0.983) {
      return {
        orbitClass: 'Atira',
        description: 'Asteroid with orbit entirely within Earth\'s orbit. Also called Interior Earth Objects.',
        confidence: 85,
        method: 'calculation',
        riskLevel: 'Medium'
      }
    }

    // Main Belt Asteroids (between Mars and Jupiter)
    if (a >= 2.1 && a <= 3.3 && e < 0.3 && i < 30) {
      return {
        orbitClass: 'Main Belt',
        description: 'Asteroid located in the main asteroid belt between Mars and Jupiter.',
        confidence: 90,
        method: 'calculation',
        riskLevel: 'Low'
      }
    }

    // Jupiter Trojans
    if (a >= 5.1 && a <= 5.4 && e < 0.1 && i < 30) {
      return {
        orbitClass: 'Trojan',
        description: 'Asteroid sharing Jupiter\'s orbit at stable Lagrange points.',
        confidence: 85,
        method: 'calculation',
        riskLevel: 'Low'
      }
    }

    // Centaurs (between Jupiter and Neptune)
    if (a >= 5.4 && a <= 30.1 && (Q > 5.2 || q < 30.1)) {
      return {
        orbitClass: 'Centaur',
        description: 'Small Solar System body with orbit between Jupiter and Neptune.',
        confidence: 80,
        method: 'calculation',
        riskLevel: 'Low'
      }
    }

    // Trans-Neptunian Objects
    if (a > 30.1) {
      return {
        orbitClass: 'Trans-Neptunian',
        description: 'Object with orbit beyond Neptune, including Kuiper Belt objects.',
        confidence: 85,
        method: 'calculation',
        riskLevel: 'Low'
      }
    }

    // Comet-like objects (high eccentricity)
    if (e > 0.7) {
      if (a > 20) {
        return {
          orbitClass: 'Long Period',
          description: 'Comet with orbital period > 200 years. Originates from the Oort Cloud.',
          confidence: 75,
          method: 'calculation',
          riskLevel: 'Low'
        }
      } else {
        return {
          orbitClass: 'Short Period',
          description: 'Comet with orbital period < 200 years. Originates from the Kuiper Belt.',
          confidence: 75,
          method: 'calculation',
          riskLevel: 'Low'
        }
      }
    }

    // High inclination objects
    if (i > 60) {
      return {
        orbitClass: 'High Inclination',
        description: 'Object with highly inclined orbit, possibly captured or perturbed.',
        confidence: 70,
        method: 'calculation',
        riskLevel: 'Medium'
      }
    }

    // Default classification based on distance
    if (a < 1.5) {
      return {
        orbitClass: 'Inner Solar System',
        description: 'Object in the inner solar system with unusual orbital parameters.',
        confidence: 60,
        method: 'calculation',
        riskLevel: 'Medium'
      }
    } else if (a < 5.5) {
      return {
        orbitClass: 'Outer Asteroid Belt',
        description: 'Asteroid in the outer regions of the asteroid belt.',
        confidence: 65,
        method: 'calculation',
        riskLevel: 'Low'
      }
    } else {
      return {
        orbitClass: 'Outer Solar System',
        description: 'Object in the outer solar system with unusual orbital parameters.',
        confidence: 60,
        method: 'calculation',
        riskLevel: 'Low'
      }
    }

  } catch (error) {
    console.warn('Error calculating orbit class:', error)
    return getFallbackClassification(isHazardous)
  }
}

// Fallback classification when calculation fails
function getFallbackClassification(isHazardous?: boolean): OrbitClassification {
  if (isHazardous) {
    return {
      orbitClass: 'Potentially Hazardous',
      description: 'Potentially hazardous asteroid with insufficient orbital data for precise classification.',
      confidence: 50,
      method: 'fallback',
      riskLevel: 'High'
    }
  }

  return {
    orbitClass: 'Unknown',
    description: 'Orbit class could not be determined due to insufficient orbital data.',
    confidence: 0,
    method: 'fallback',
    riskLevel: 'Low'
  }
}

// Extract orbital elements from NASA API data
export function extractOrbitalElements(nasaData: any): OrbitalElements {
  const orbitalData = nasaData.orbital_data || {}
  
  return {
    semiMajorAxis: parseFloat(orbitalData.semi_major_axis) || undefined,
    eccentricity: parseFloat(orbitalData.eccentricity) || undefined,
    inclination: parseFloat(orbitalData.inclination) || undefined,
    perihelionDistance: parseFloat(orbitalData.perihelion_distance) || undefined,
    aphelionDistance: parseFloat(orbitalData.aphelion_distance) || undefined,
    orbitalPeriod: parseFloat(orbitalData.orbital_period) || undefined,
    argumentOfPerihelion: parseFloat(orbitalData.argument_of_perihelion) || undefined,
    longitudeOfAscendingNode: parseFloat(orbitalData.longitude_of_ascending_node) || undefined,
    meanAnomaly: parseFloat(orbitalData.mean_anomaly) || undefined
  }
}

// Enhanced orbit class determination with multiple methods
export function determineOrbitClass(nasaData: any, jplData?: any): OrbitClassification {
  // First, try to get orbit class from JPL data if available
  if (jplData?.object?.class || jplData?.orbit?.class) {
    const jplClass = jplData.object?.class || jplData.orbit?.class
    return {
      orbitClass: jplClass,
      description: jplData.object?.class_name || jplData.orbit?.class_name || `JPL classified as ${jplClass}`,
      confidence: 95,
      method: 'api',
      riskLevel: getRiskLevelFromClass(jplClass)
    }
  }

  // Try NASA orbital data
  if (nasaData.orbital_data?.orbit_class) {
    // Handle both string and object formats
    let orbitClassString = nasaData.orbital_data.orbit_class
    let description = `NASA classified as ${orbitClassString}`
    
    if (typeof nasaData.orbital_data.orbit_class === 'object') {
      orbitClassString = nasaData.orbital_data.orbit_class.orbit_class_type || 'Unknown'
      description = nasaData.orbital_data.orbit_class.orbit_class_description || `NASA classified as ${orbitClassString}`
    }
    
    return {
      orbitClass: orbitClassString,
      description: description,
      confidence: 95,
      method: 'api',
      riskLevel: getRiskLevelFromClass(orbitClassString)
    }
  }

  // Calculate from orbital elements
  const elements = extractOrbitalElements(nasaData)
  if (elements.semiMajorAxis && elements.eccentricity && elements.inclination) {
    return calculateOrbitClass(elements, nasaData.is_potentially_hazardous_asteroid)
  }

  // Final fallback
  return getFallbackClassification(nasaData.is_potentially_hazardous_asteroid)
}

// Get risk level from orbit class
function getRiskLevelFromClass(orbitClass: string): 'Low' | 'Medium' | 'High' {
  const highRisk = ['Apollo', 'Aten', 'APO', 'ATE']
  const mediumRisk = ['Amor', 'Atira', 'AMO', 'ATI', 'Potentially Hazardous']
  
  // Ensure orbitClass is a string
  if (!orbitClass || typeof orbitClass !== 'string') {
    return 'Low'
  }
  
  const normalizedClass = orbitClass.toUpperCase()
  
  if (highRisk.some(risk => normalizedClass.includes(risk))) {
    return 'High'
  }
  
  if (mediumRisk.some(risk => normalizedClass.includes(risk))) {
    return 'Medium'
  }
  
  return 'Low'
}

// AI-powered orbit class prediction using Gemini 2.0 Flash
export async function predictOrbitClassWithAI(asteroidData: any): Promise<OrbitClassification> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    
    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === 'your_actual_gemini_api_key_here') {
      console.warn('Gemini API key not found, using calculation fallback')
      return calculateOrbitClassFromApproachData(asteroidData)
    }

    // Summarize asteroid data for AI
    const approach = asteroidData.close_approach_data?.[0]
    const missDistance = parseFloat(approach?.miss_distance?.astronomical || '0')
    const velocity = parseFloat(approach?.relative_velocity?.kilometers_per_second || '0')
    const diameter = asteroidData.estimated_diameter?.meters ? 
      (asteroidData.estimated_diameter.meters.estimated_diameter_min + asteroidData.estimated_diameter.meters.estimated_diameter_max) / 2 : 0

    const summary = {
      name: asteroidData.name || 'Unknown',
      diameter: Math.round(diameter),
      velocity: velocity.toFixed(1),
      missDistance: missDistance.toFixed(4),
      isHazardous: asteroidData.is_potentially_hazardous_asteroid || false,
      magnitude: asteroidData.absolute_magnitude_h || 'unknown'
    }

    // Call Gemini 2.0 Flash for orbit class prediction
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Predict the orbit class for this asteroid based on available data:

ASTEROID DATA:
- Name: ${summary.name}
- Diameter: ${summary.diameter}m
- Velocity: ${summary.velocity} km/s
- Miss Distance: ${summary.missDistance} AU
- Hazardous: ${summary.isHazardous}
- Magnitude: ${summary.magnitude}

Based on this data, predict the most likely orbit class from these options:
- Apollo (Earth-crossing, a > 1 AU)
- Aten (Earth-crossing, a < 1 AU)
- Amor (Near-Earth, doesn't cross)
- Atira (Interior Earth Objects)
- Main Belt (2.1-3.3 AU)
- Unknown (insufficient data)

IMPORTANT: Respond with ONLY the orbit class name and a brief explanation. Format: "CLASS: [name] | REASON: [explanation]" - No markdown, no formatting, plain text only.`
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 256,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const result = await response.json()
    const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    // Parse AI response
    const classMatch = aiResponse.match(/CLASS:\s*([A-Za-z\s]+?)\s*\|/)
    const reasonMatch = aiResponse.match(/REASON:\s*(.+)/)
    
    let predictedClass = 'Unknown'
    let explanation = 'Insufficient data for precise classification'
    
    if (classMatch) {
      predictedClass = classMatch[1].trim()
    }
    
    if (reasonMatch) {
      explanation = reasonMatch[1].trim()
    }

    return {
      orbitClass: predictedClass,
      description: `AI-predicted: ${explanation}`,
      confidence: 60, // Moderate confidence for AI predictions
      method: 'ai',
      riskLevel: getRiskLevelFromClass(predictedClass)
    }
    
  } catch (error) {
    console.warn('AI orbit class prediction failed:', error)
    return calculateOrbitClassFromApproachData(asteroidData)
  }
}

// Enhanced calculation fallback when AI is unavailable
function calculateOrbitClassFromApproachData(asteroidData: any): OrbitClassification {
  try {
    const elements = extractOrbitalElements(asteroidData)
    
    // If we have some data, try to infer missing elements
    if (asteroidData.close_approach_data?.[0]) {
      const approach = asteroidData.close_approach_data[0]
      const missDistance = parseFloat(approach.miss_distance?.astronomical || '0')
      const velocity = parseFloat(approach.relative_velocity?.kilometers_per_second || '0')
      
      // Estimate semi-major axis from approach velocity (rough approximation)
      if (!elements.semiMajorAxis && velocity > 0) {
        // Simplified estimation - in reality this is much more complex
        const estimatedA = Math.max(1.0, Math.min(5.0, 30 / velocity))
        elements.semiMajorAxis = estimatedA
      }
      
      // Estimate if it's a near-Earth object based on miss distance
      if (missDistance < 0.1) { // Very close approach
        elements.eccentricity = elements.eccentricity || 0.3
        elements.inclination = elements.inclination || 15
      }
    }
    
    return calculateOrbitClass(elements, asteroidData.is_potentially_hazardous_asteroid)
    
  } catch (error) {
    console.warn('Calculation fallback failed:', error)
    return getFallbackClassification(asteroidData.is_potentially_hazardous_asteroid)
  }
}
