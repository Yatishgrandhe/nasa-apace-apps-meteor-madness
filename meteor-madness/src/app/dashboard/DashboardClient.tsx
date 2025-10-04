'use client'

import { motion } from 'framer-motion'
import { Zap, Shield, Target, TrendingUp, Users, Globe, Activity } from 'lucide-react'
import Navigation from '@/components/Navigation'
import AIResponse from '@/components/AIResponse'
import { fetchNEOData, fetchCometData, transformNEOData, transformCometData } from '@/lib/api/neo'
import { analyzeImpactWithGemini } from '@/lib/api/gemini'
import { useEffect, useState } from 'react'

interface DashboardClientProps {}

export default function DashboardClient({}: DashboardClientProps) {
  const [neoData, setNeoData] = useState<any[]>([])
  const [cometData, setCometData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [aiAnalysis, setAiAnalysis] = useState<string>('')
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError('')
        
        const [neoResponse, cometResponse] = await Promise.allSettled([
          fetchNEOData(),
          fetchCometData()
        ])
        
        // Handle successful responses
        const transformedNEO = neoResponse.status === 'fulfilled' 
          ? transformNEOData(neoResponse.value) 
          : []
        const transformedComets = cometResponse.status === 'fulfilled' 
          ? transformCometData(cometResponse.value) 
          : []
        
        setNeoData(transformedNEO)
        setCometData(transformedComets)
        
        // Check if both API calls failed
        if (neoResponse.status === 'rejected' && cometResponse.status === 'rejected') {
          setError('Unable to load NASA data. Please check your API configuration.')
        } else if (neoResponse.status === 'rejected') {
          setError('Asteroid data unavailable. Comet data loaded.')
        } else if (cometResponse.status === 'rejected') {
          setError('Comet data unavailable. Asteroid data loaded.')
        }
        
      } catch (error) {
        console.error('Error loading data:', error)
        setError('Failed to load NASA data. Please try again later.')
        setNeoData([])
        setCometData([])
      } finally {
        setLoading(false)
      }
    }

    // Only load data on client side
    if (typeof window !== 'undefined') {
      loadData()
    }
  }, [])

  const runAiAnalysis = async () => {
    try {
      setAnalyzing(true)
      const combinedData = [...neoData, ...cometData]
      const analysisData = {
        objects: combinedData.map(obj => ({
          name: obj.name,
          diameter: obj.diameter,
          velocity: obj.velocity,
          missDistance: obj.missDistance,
          approachDate: obj.approachDate,
          isHazardous: obj.isHazardous
        }))
      }
      const result = await analyzeImpactWithGemini(analysisData)
      setAiAnalysis(result.analysis)
    } catch (error) {
      console.error('Error running AI analysis:', error)
      setAiAnalysis('AI analysis temporarily unavailable. Using real-time monitoring data.')
    } finally {
      setAnalyzing(false)
    }
  }

  const generateRiskAssessment = () => {
    const combinedData = [...neoData, ...cometData]
    const hazardousCount = combinedData.filter(obj => obj.isHazardous).length
    const closestApproach = Math.min(...combinedData.map(obj => obj.missDistance))
    const totalObjects = combinedData.length
    
    let riskLevel = 'Low'
    if (hazardousCount > 5 || closestApproach < 0.01) {
      riskLevel = 'Critical'
    } else if (hazardousCount > 2 || closestApproach < 0.05) {
      riskLevel = 'High'
    } else if (hazardousCount > 0) {
      riskLevel = 'Medium'
    }
    
    return {
      riskLevel,
      hazardousCount,
      closestApproach,
      totalObjects,
      assessment: `Current risk level: ${riskLevel}. ${hazardousCount} hazardous objects detected. Closest approach: ${closestApproach.toFixed(4)} AU.`
    }
  }

  const hazardousCount = [...neoData, ...cometData].filter(obj => obj.isHazardous).length
  const totalObjects = neoData.length + cometData.length
  const recentApproaches = [...neoData, ...cometData]
    .filter(obj => new Date(obj.approachDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .length
  const stats = [
    {
      title: 'Objects Monitored',
      value: loading ? '...' : totalObjects.toString(),
      change: `+${recentApproaches} recent`,
      icon: Globe,
      color: 'from-cyan-500 to-blue-600'
    },
    {
      title: 'Hazardous Objects',
      value: loading ? '...' : hazardousCount.toString(),
      change: hazardousCount > 5 ? 'High Alert' : 'Stable',
      icon: Shield,
      color: hazardousCount > 5 ? 'from-red-500 to-red-600' : 'from-yellow-500 to-yellow-600'
    },
    {
      title: 'Recent Approaches',
      value: loading ? '...' : recentApproaches.toString(),
      change: 'Last 30 days',
      icon: Target,
      color: 'from-purple-500 to-pink-600'
    },
    {
      title: 'AI Analysis',
      value: 'Active',
      change: 'Real-time monitoring',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600'
    }
  ]


  return (
    <div className="min-h-screen nasa-bg">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mb-6 shadow-lg glow-blue"
            >
              <Target className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent mb-4"
            >
              Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-xl text-gray-300 max-w-2xl mx-auto"
            >
              Monitor Near-Earth Objects and space threats with real-time NASA data and AI analysis.
            </motion.p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 shadow-lg glow-blue"
              >
                <div className="flex items-center justify-between mb-6">
                  <motion.div 
                    className={`p-4 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}
                    whileHover={{ rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <stat.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{stat.change}</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
                <p className="text-gray-300 font-medium">{stat.title}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Content Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 glow-blue"
            >
              <div className="flex items-center justify-between mb-8">
                <motion.h2 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-2xl font-bold text-white"
                >
                  Recent Activity
                </motion.h2>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 1, type: "spring", stiffness: 200 }}
                  className="p-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl shadow-lg glow-blue"
                >
                  <Activity className="w-6 h-6 text-white" />
                </motion.div>
              </div>
              
              <div className="space-y-4">
                {[
                  { action: 'Asteroid 2024-AB detected', time: '2 minutes ago', type: 'detection' },
                  { action: 'Hazardous object analysis complete', time: '1 hour ago', type: 'success' },
                  { action: 'AI threat assessment updated', time: '3 hours ago', type: 'info' },
                  { action: 'Meteor shower predicted', time: '5 hours ago', type: 'warning' },
                  { action: 'System maintenance completed', time: '1 day ago', type: 'info' }
                ].map((activity, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    whileHover={{ x: 5 }}
                    className="bg-gradient-to-r from-gray-900/50 to-cyan-900/30 rounded-xl p-4 border border-cyan-500/20 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'detection' ? 'bg-red-400' :
                          activity.type === 'success' ? 'bg-green-400' :
                          activity.type === 'warning' ? 'bg-yellow-400' :
                          'bg-cyan-400'
                        }`} />
                        <span className="text-white font-medium">{activity.action}</span>
                      </div>
                      <span className="text-gray-400 text-sm">{activity.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>


            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.5 }}
                className="bg-red-900/40 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 shadow-lg"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-6 h-6 text-red-400" />
                  <h3 className="text-xl font-bold text-red-400">Data Loading Issue</h3>
                </div>
                <p className="text-gray-300">{error}</p>
              </motion.div>
            )}

            {/* AI Risk Assessment Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 shadow-lg glow-blue"
            >
              <div className="flex items-center justify-between mb-6">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.6 }}
                  className="text-2xl font-bold text-white"
                >
                  AI Risk Assessment
                </motion.h2>
                <div className="flex items-center space-x-3">
                  <motion.button
                    onClick={runAiAnalysis}
                    disabled={analyzing}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3 disabled:opacity-50 glow-purple"
                  >
                    <Zap className="w-5 h-5" />
                    <span>{analyzing ? 'Analyzing...' : 'AI Analysis'}</span>
                  </motion.button>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 1.8, type: "spring", stiffness: 200 }}
                    className="p-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl shadow-lg glow-blue"
                  >
                    <Shield className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7 }}
                className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50"
              >
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mb-4 animate-pulse">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-gray-400">Loading NASA data...</p>
                  </div>
                ) : aiAnalysis ? (
                  <AIResponse 
                    content={aiAnalysis} 
                    title="Mission Control Insights"
                    type="insight"
                    className="mb-4"
                  />
                ) : (
                  <div className="space-y-4">
                    {(() => {
                      const assessment = generateRiskAssessment()
                      return (
                        <>
                          <div className="flex items-center space-x-2 mb-4">
                            <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                            <span className="text-cyan-400 font-semibold">Real-Time Assessment</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-800/50 rounded-lg p-4">
                              <div className="text-sm text-gray-400 mb-1">Risk Level</div>
                              <div className={`text-2xl font-bold ${
                                assessment.riskLevel === 'Critical' ? 'text-red-400' :
                                assessment.riskLevel === 'High' ? 'text-orange-400' :
                                assessment.riskLevel === 'Medium' ? 'text-yellow-400' :
                                'text-green-400'
                              }`}>
                                {assessment.riskLevel}
                              </div>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-4">
                              <div className="text-sm text-gray-400 mb-1">Hazardous Objects</div>
                              <div className="text-2xl font-bold text-white">{assessment.hazardousCount}</div>
                            </div>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="text-sm text-gray-400 mb-2">Assessment Details</div>
                            <p className="text-gray-300">{assessment.assessment}</p>
                          </div>
                          <div className="text-center py-4">
                            <p className="text-gray-400 text-sm">Click "AI Analysis" for advanced threat assessment</p>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
    </div>
  )
}
