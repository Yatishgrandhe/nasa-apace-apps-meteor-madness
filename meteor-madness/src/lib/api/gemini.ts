// Gemini AI API integration for Meteor Madness
// Provides AI-powered analysis for asteroid and comet data

export interface GeminiAnalysisRequest {
  data: {
    asteroids: Array<{
      name: string
      diameter: number
      velocity: number
      miss_distance: number
      is_hazardous: boolean
    }>
    comets: Array<{
      name: string
      diameter: number
      velocity: number
      miss_distance: number
      is_hazardous: boolean
    }>
  }
}

export interface GeminiAnalysisResponse {
  analysis: string
  riskAssessment: string
  recommendations: string[]
}

// Analyze space object data with Gemini AI
export async function analyzeWithGemini(request: GeminiAnalysisRequest): Promise<GeminiAnalysisResponse> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY environment variable.')
  }

  try {
    const prompt = `
    As a NASA space analyst, analyze the following asteroid and comet data for potential Earth impact risks:
    
    Asteroids: ${JSON.stringify(request.data.asteroids)}
    Comets: ${JSON.stringify(request.data.comets)}
    
    Provide:
    1. A comprehensive risk assessment
    2. Analysis of the most concerning objects
    3. Recommendations for monitoring priorities
    4. Potential impact scenarios and probabilities
    
    Focus on scientific accuracy and actionable insights.
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid Gemini API response structure');
    }

    const analysis = data.candidates[0].content.parts[0].text;
    
    // Parse the analysis into structured format
    const lines = analysis.split('\n').filter(line => line.trim());
    const riskAssessment = lines.find(line => line.toLowerCase().includes('risk')) || 'Risk assessment pending';
    const recommendations = lines.filter(line => 
      line.toLowerCase().includes('recommend') || 
      line.toLowerCase().includes('suggest') ||
      line.startsWith('-') ||
      line.startsWith('•')
    );

    return {
      analysis: analysis,
      riskAssessment: riskAssessment,
      recommendations: recommendations.length > 0 ? recommendations : ['Continue monitoring all objects', 'Maintain current tracking protocols']
    };

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Return fallback analysis
    const hazardousCount = request.data.asteroids.filter(obj => obj.is_hazardous).length + 
                          request.data.comets.filter(obj => obj.is_hazardous).length;
    
    return {
      analysis: `Analysis of ${request.data.asteroids.length} asteroids and ${request.data.comets.length} comets. ${hazardousCount} objects classified as potentially hazardous.`,
      riskAssessment: hazardousCount > 0 ? 'Moderate risk detected' : 'Low risk assessment',
      recommendations: [
        'Continue monitoring all near-Earth objects',
        'Prioritize tracking of hazardous objects',
        'Maintain regular orbital calculations',
        'Update impact probability models'
      ]
    };
  }
}

// Legacy function name for compatibility
export const analyzeImpactWithGemini = analyzeWithGemini;

// Generate AI-powered insights for dashboard
export async function generateDashboardInsights(): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  
  if (!apiKey) {
    return 'AI analysis unavailable - API key not configured. Using real-time NASA data for monitoring.';
  }

  try {
    const prompt = `
    Generate a brief, professional summary for a NASA monitoring dashboard about current near-Earth object monitoring activities. 
    Include insights about asteroid tracking, impact risk assessment, and space monitoring priorities.
    Keep it concise (2-3 sentences) and authoritative.
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    }

    throw new Error('Invalid response structure');

  } catch (error) {
    console.warn('Gemini API unavailable, using fallback insights:', error);
    return 'Real-time monitoring active. Tracking near-Earth objects and assessing impact risks using NASA data.';
  }
}
