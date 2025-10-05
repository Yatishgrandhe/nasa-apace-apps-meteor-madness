'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Rocket, 
  Satellite, 
  AlertTriangle, 
  Clock, 
  Globe, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Zap,
  Target,
  Building,
  Radio
} from 'lucide-react'
import { 
  getMitigationStrategiesWithGemini, 
  type MitigationStrategyRequest, 
  type MitigationStrategyResponse 
} from '@/lib/api/gemini'

interface MitigationStrategiesProps {
  asteroid: {
    name: string
    diameter: {
      min: number
      max: number
    }
    velocity: number
    missDistance: number
    isHazardous: boolean
    approachDate: string
  }
  impactData?: {
    impactProbability?: number
    impactEnergy?: number
    craterSize?: {
      diameter: number
      depth: number
    }
    affectedRadius?: number
  }
  className?: string
}

export default function MitigationStrategies({ asteroid, impactData, className = '' }: MitigationStrategiesProps) {
  const [mitigationData, setMitigationData] = useState<MitigationStrategyResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMitigationStrategies = async () => {
      try {
        setLoading(true)
        
        const requestData: MitigationStrategyRequest = {
          name: asteroid.name,
          type: 'asteroid',
          diameter: asteroid.diameter,
          velocity: asteroid.velocity,
          missDistance: asteroid.missDistance,
          isHazardous: asteroid.isHazardous,
          approachDate: asteroid.approachDate,
          ...impactData
        }

        const strategies = await getMitigationStrategiesWithGemini(requestData)
        setMitigationData(strategies)
      } catch (err) {
        console.error('Error fetching mitigation strategies:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch mitigation strategies')
      } finally {
        setLoading(false)
      }
    }

    fetchMitigationStrategies()
  }, [asteroid, impactData])

  const getFeasibilityColor = (feasibility: string) => {
    switch (feasibility.toLowerCase()) {
      case 'high': return 'text-green-400 bg-green-900/20 border-green-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30'
      case 'low': return 'text-red-400 bg-red-900/20 border-red-500/30'
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30'
    }
  }

  const getFeasibilityIcon = (feasibility: string) => {
    switch (feasibility.toLowerCase()) {
      case 'high': return <CheckCircle className="w-4 h-4" />
      case 'medium': return <AlertCircle className="w-4 h-4" />
      case 'low': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-400 bg-red-900/20 border-red-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30'
      case 'low': return 'text-green-400 bg-green-900/20 border-green-500/30'
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'detection & tracking': return <Satellite className="w-5 h-5" />
      case 'kinetic impactor': return <Rocket className="w-5 h-5" />
      case 'gravity tractor': return <Target className="w-5 h-5" />
      case 'nuclear deflection': return <Zap className="w-5 h-5" />
      case 'civil defense': return <Building className="w-5 h-5" />
      default: return <Shield className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className={`bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 shadow-lg glow-blue ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 text-lg font-medium">Analyzing mitigation strategies...</p>
          <p className="text-gray-400 text-sm mt-2">Consulting NASA planetary defense protocols</p>
        </div>
      </div>
    )
  }

  if (error || !mitigationData) {
    return (
      <div className={`bg-black/40 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 shadow-lg glow-red ${className}`}>
        <div className="text-center py-8">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-lg font-medium">Failed to load mitigation strategies</p>
          <p className="text-gray-400 text-sm mt-2">{error || 'Please try again later'}</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={`bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl shadow-lg glow-blue ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-cyan-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-sans">Mitigation Strategies</h3>
            <p className="text-gray-400 text-sm font-medium">Asteroid: {asteroid.name}</p>
          </div>
        </div>
      </div>

      {/* Strategy Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {mitigationData.strategies.map((strategy, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-black/30 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-400/40 transition-all duration-300"
            >
              {/* Strategy Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    {getCategoryIcon(strategy.category)}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white font-sans">{strategy.title}</h4>
                    <p className="text-sm text-cyan-400 font-medium">{strategy.category}</p>
                  </div>
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-medium ${getFeasibilityColor(strategy.feasibility)}`}>
                  {getFeasibilityIcon(strategy.feasibility)}
                  <span className="capitalize">{strategy.feasibility}</span>
                </div>
              </div>

              {/* Strategy Description */}
              <p className="text-gray-300 text-sm leading-relaxed mb-4 font-sans">
                {strategy.description}
              </p>

              {/* Strategy Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm font-medium">Timeframe:</span>
                  <span className="text-white text-sm font-medium">{strategy.timeframe}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm font-medium">Effectiveness:</span>
                  <span className="text-green-400 text-sm font-medium">{strategy.effectiveness}</span>
                </div>
                {strategy.estimatedCost && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm font-medium">Estimated Cost:</span>
                    <span className="text-yellow-400 text-sm font-medium">{strategy.estimatedCost}</span>
                  </div>
                )}
              </div>

              {/* Requirements */}
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-300 mb-2 font-sans">Requirements:</h5>
                <div className="flex flex-wrap gap-2">
                  {strategy.requirements.map((requirement, reqIndex) => (
                    <span
                      key={reqIndex}
                      className="px-2 py-1 bg-cyan-900/30 border border-cyan-500/30 rounded text-xs text-cyan-300 font-medium"
                    >
                      {requirement}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Implementation Timeline */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center space-x-2 font-sans">
            <Clock className="w-5 h-5" />
            <span>Implementation Timeline</span>
          </h4>
          <div className="space-y-4">
            {mitigationData.timeline.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-black/20 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-white font-medium font-sans">{phase.phase}</h5>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400 text-sm font-medium">{phase.duration}</span>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getPriorityColor(phase.priority)}`}>
                      <span className="capitalize">{phase.priority} Priority</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm font-sans">{phase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Global Coordination & Public Preparedness */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Global Coordination */}
          <div className="bg-black/20 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center space-x-2 font-sans">
              <Globe className="w-5 h-5" />
              <span>Global Coordination</span>
            </h4>
            <div className="space-y-3">
              {mitigationData.globalCoordination.map((coordination, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300 text-sm font-sans leading-relaxed">{coordination}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Public Preparedness */}
          <div className="bg-black/20 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center space-x-2 font-sans">
              <Users className="w-5 h-5" />
              <span>Public Preparedness</span>
            </h4>
            <div className="space-y-3">
              {mitigationData.publicPreparedness.map((preparedness, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300 text-sm font-sans leading-relaxed">{preparedness}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-start space-x-2">
            <Radio className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-blue-200 text-sm font-sans">
              <div className="font-semibold mb-1">Data Source:</div>
              <div>
                Mitigation strategies are based on NASA's Planetary Defense Strategy, DART mission results, 
                and international protocols from IAWN, COPUOS, and SMPAG. Last updated: {new Date(mitigationData.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
