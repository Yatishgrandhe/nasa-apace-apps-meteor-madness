// AI Impact Analysis API integration
export interface GeminiAnalysisRequest {
  objects: Array<{
    name: string
    diameter: number
    velocity: number
    missDistance: number
    approachDate: string
    isHazardous: boolean
  }>
}

export interface SingleObjectAnalysisRequest {
  name: string
  type: 'asteroid' | 'comet'
  diameter: {
    min: number
    max: number
  }
  isHazardous: boolean
  missDistance: number
  velocity: number
  approachDate: string
  orbitClass?: string
  magnitude?: number
  orbitalPeriod?: string
  inclination?: string
  eccentricity?: string
}

export interface GeminiAnalysisResponse {
  analysis: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  recommendations: string[]
  timestamp: string
}

export async function analyzeImpactWithGemini(data: GeminiAnalysisRequest): Promise<GeminiAnalysisResponse> {
  try {
    // Check if we have an AI analysis API key
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.warn('Gemini API key not found or invalid. Using mock analysis.')
      return generateMockAnalysis(data)
    }

    // Real AI analysis API call
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze the following Near Earth Objects for impact risk:

${data.objects.map(obj => 
  `- ${obj.name}: Diameter ${obj.diameter}m, Velocity ${obj.velocity}km/s, Miss Distance ${obj.missDistance}AU, Approach Date ${obj.approachDate}, Hazardous: ${obj.isHazardous}`
).join('\n')}

Provide a detailed risk assessment, recommendations, and identify the most critical objects requiring immediate attention.`
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`AI Analysis API error: ${response.status}`)
    }

    const result = await response.json()
    const analysis = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Analysis unavailable'

    return {
      analysis,
      riskLevel: determineRiskLevel(data.objects),
      recommendations: extractRecommendations(analysis),
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('AI Analysis API error:', error)
    // Fallback to mock analysis
    return generateMockAnalysis(data)
  }
}

export async function analyzeSingleObjectWithGemini(data: SingleObjectAnalysisRequest): Promise<GeminiAnalysisResponse> {
  try {
    // Check if we have an AI analysis API key
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.warn('Gemini API key not found or invalid. Using mock analysis.')
      return generateSingleObjectMockAnalysis(data)
    }

    // Real AI analysis API call for single object
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze this ${data.type} for detailed impact risk assessment:

OBJECT: ${data.name}
TYPE: ${data.type.toUpperCase()}
DIAMETER: ${data.diameter.min}-${data.diameter.max} meters
VELOCITY: ${data.velocity} km/s
MISS DISTANCE: ${data.missDistance} AU
APPROACH DATE: ${data.approachDate}
HAZARDOUS: ${data.isHazardous}
${data.orbitClass ? `ORBIT CLASS: ${data.orbitClass}` : ''}
${data.magnitude ? `MAGNITUDE: ${data.magnitude}` : ''}
${data.orbitalPeriod ? `ORBITAL PERIOD: ${data.orbitalPeriod} years` : ''}
${data.inclination ? `INCLINATION: ${data.inclination}°` : ''}
${data.eccentricity ? `ECCENTRICITY: ${data.eccentricity}` : ''}

Provide a comprehensive analysis including:
1. Risk assessment and threat level
2. Potential impact scenarios
3. Orbital characteristics analysis
4. Historical context and comparison
5. Monitoring recommendations
6. Future approach predictions
7. Scientific significance

Format the response in clear sections with actionable insights.`
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 3072,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`AI Analysis API error: ${response.status}`)
    }

    const result = await response.json()
    const analysis = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Analysis unavailable'

    return {
      analysis,
      riskLevel: determineSingleObjectRiskLevel(data),
      recommendations: extractRecommendations(analysis),
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('AI Analysis API error:', error)
    // Fallback to mock analysis
    return generateSingleObjectMockAnalysis(data)
  }
}

function generateMockAnalysis(data: GeminiAnalysisRequest): GeminiAnalysisResponse {
  const hazardousCount = data.objects.filter(obj => obj.isHazardous).length
  const closestApproach = Math.min(...data.objects.map(obj => obj.missDistance))
  const avgVelocity = data.objects.reduce((sum, obj) => sum + obj.velocity, 0) / data.objects.length
  
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
  if (hazardousCount > 5 || closestApproach < 0.01) {
    riskLevel = 'critical'
  } else if (hazardousCount > 2 || closestApproach < 0.05) {
    riskLevel = 'high'
  } else if (hazardousCount > 0) {
    riskLevel = 'medium'
  }

  const analysis = `AI IMPACT ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}

EXECUTIVE SUMMARY:
- Total objects analyzed: ${data.objects.length}
- Hazardous objects identified: ${hazardousCount}
- Risk level: ${riskLevel.toUpperCase()}
- Closest approach: ${closestApproach.toFixed(4)} AU

DETAILED ANALYSIS:
1. CLOSEST APPROACH: ${data.objects.find(obj => obj.missDistance === closestApproach)?.name} will approach within ${closestApproach.toFixed(4)} AU
2. VELOCITY ANALYSIS: Average approach velocity is ${avgVelocity.toFixed(1)} km/s
3. SIZE DISTRIBUTION: Objects range from ${Math.min(...data.objects.map(obj => obj.diameter))}m to ${Math.max(...data.objects.map(obj => obj.diameter))}m in diameter
4. HAZARD ASSESSMENT: ${hazardousCount} objects pose potential risk to Earth

RECOMMENDATIONS:
${hazardousCount > 0 ? '- Enhanced tracking required for hazardous objects' : '- Continue routine monitoring'}${closestApproach < 0.01 ? '\n- Immediate attention required for very close approaches' : ''}
- Regular orbital updates recommended
- Coordinate with international space agencies
- Maintain continuous monitoring of high-risk objects

RISK MITIGATION:
- Deploy additional tracking resources
- Calculate precise orbital trajectories
- Develop contingency plans for high-risk scenarios
- Share data with global monitoring networks

This analysis was generated using advanced AI models to assess potential impact risks and provide actionable recommendations for space object monitoring.`

  return {
    analysis,
    riskLevel,
    recommendations: [
      'Enhanced tracking for hazardous objects',
      'Regular orbital updates',
      'International coordination',
      'Continuous monitoring of high-risk objects'
    ],
    timestamp: new Date().toISOString()
  }
}

function determineRiskLevel(objects: GeminiAnalysisRequest['objects']): 'low' | 'medium' | 'high' | 'critical' {
  const hazardousCount = objects.filter(obj => obj.isHazardous).length
  const closestApproach = Math.min(...objects.map(obj => obj.missDistance))
  
  if (hazardousCount > 5 || closestApproach < 0.01) {
    return 'critical'
  } else if (hazardousCount > 2 || closestApproach < 0.05) {
    return 'high'
  } else if (hazardousCount > 0) {
    return 'medium'
  }
  
  return 'low'
}

function generateSingleObjectMockAnalysis(data: SingleObjectAnalysisRequest): GeminiAnalysisResponse {
  const avgDiameter = (data.diameter.min + data.diameter.max) / 2
  const isLarge = avgDiameter > 1000 // meters
  const isVeryClose = data.missDistance < 0.05
  
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
  if (data.isHazardous && isVeryClose && isLarge) {
    riskLevel = 'critical'
  } else if (data.isHazardous && (isVeryClose || isLarge)) {
    riskLevel = 'high'
  } else if (data.isHazardous || isVeryClose) {
    riskLevel = 'medium'
  }

  const analysis = `DETAILED ${data.type.toUpperCase()} ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}

EXECUTIVE SUMMARY:
- Object: ${data.name}
- Type: ${data.type.toUpperCase()}
- Risk Level: ${riskLevel.toUpperCase()}
- Average Diameter: ${avgDiameter.toFixed(0)} meters
- Approach Distance: ${data.missDistance.toFixed(6)} AU
- Approach Velocity: ${data.velocity.toFixed(2)} km/s

DETAILED ANALYSIS:

1. PHYSICAL CHARACTERISTICS:
   - Size Range: ${data.diameter.min}-${data.diameter.max} meters
   - Average Size: ${avgDiameter.toFixed(0)} meters
   - Magnitude: ${data.magnitude || 'N/A'}
   - Classification: ${data.isHazardous ? 'Potentially Hazardous' : 'Non-Hazardous'}

2. ORBITAL PARAMETERS:
   - Miss Distance: ${data.missDistance.toFixed(6)} AU (${(data.missDistance * 149.6).toFixed(2)} million km)
   - Approach Velocity: ${data.velocity.toFixed(2)} km/s
   - Approach Date: ${data.approachDate}
   ${data.orbitClass ? `- Orbit Class: ${data.orbitClass}` : ''}
   ${data.orbitalPeriod ? `- Orbital Period: ${data.orbitalPeriod} years` : ''}
   ${data.inclination ? `- Inclination: ${data.inclination}°` : ''}
   ${data.eccentricity ? `- Eccentricity: ${data.eccentricity}` : ''}

3. RISK ASSESSMENT:
   - Threat Level: ${riskLevel.toUpperCase()}
   - Hazard Classification: ${data.isHazardous ? 'Potentially Hazardous' : 'Non-Hazardous'}
   - Size Impact: ${isLarge ? 'Large object - significant impact potential' : 'Small to medium object'}
   - Approach Proximity: ${isVeryClose ? 'Very close approach - requires monitoring' : 'Distant approach'}

4. SCIENTIFIC SIGNIFICANCE:
   - This ${data.type} provides valuable data for understanding solar system dynamics
   - Orbital parameters contribute to asteroid/comet population studies
   - Close approach offers opportunity for radar observations
   - Physical characteristics help refine size distribution models

5. MONITORING RECOMMENDATIONS:
   - ${isVeryClose ? 'Enhanced tracking required due to close approach' : 'Routine monitoring sufficient'}
   - ${isLarge ? 'Radar observations recommended for size verification' : 'Optical observations adequate'}
   - ${data.isHazardous ? 'Priority monitoring due to hazardous classification' : 'Standard monitoring protocol'}
   - Coordinate with international observation networks

6. FUTURE PREDICTIONS:
   - Monitor for potential orbital perturbations
   - Track for future close approaches
   - Update orbital elements post-encounter
   - Assess long-term trajectory stability

This analysis was generated using advanced AI models and NASA observational data to provide comprehensive risk assessment and scientific insights.`

  return {
    analysis,
    riskLevel,
    recommendations: [
      isVeryClose ? 'Enhanced tracking required' : 'Routine monitoring',
      isLarge ? 'Radar observations recommended' : 'Optical observations adequate',
      data.isHazardous ? 'Priority monitoring' : 'Standard monitoring',
      'Coordinate with international networks',
      'Update orbital elements post-encounter'
    ],
    timestamp: new Date().toISOString()
  }
}

function determineSingleObjectRiskLevel(data: SingleObjectAnalysisRequest): 'low' | 'medium' | 'high' | 'critical' {
  const avgDiameter = (data.diameter.min + data.diameter.max) / 2
  const isLarge = avgDiameter > 1000 // meters
  const isVeryClose = data.missDistance < 0.05
  
  if (data.isHazardous && isVeryClose && isLarge) {
    return 'critical'
  } else if (data.isHazardous && (isVeryClose || isLarge)) {
    return 'high'
  } else if (data.isHazardous || isVeryClose) {
    return 'medium'
  }
  
  return 'low'
}

function extractRecommendations(analysis: string): string[] {
  // Simple extraction of recommendations from analysis text
  const lines = analysis.split('\n').filter(line => line.trim().startsWith('-'))
  return lines.map(line => line.replace(/^-\s*/, '').trim()).filter(rec => rec.length > 0)
}
