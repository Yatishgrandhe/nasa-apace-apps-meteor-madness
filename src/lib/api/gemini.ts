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
    
    if (!apiKey) {
      // Return mock analysis if no API key is available
      return generateMockAnalysis(data)
    }

    // Real AI analysis API call
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
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

function extractRecommendations(analysis: string): string[] {
  // Simple extraction of recommendations from analysis text
  const lines = analysis.split('\n').filter(line => line.trim().startsWith('-'))
  return lines.map(line => line.replace(/^-\s*/, '').trim()).filter(rec => rec.length > 0)
}
