'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Activity,
  Globe,
  Zap
} from 'lucide-react'
import Navigation from '@/components/Navigation'
import AIResponse from '@/components/AIResponse'
import { fetchNEOData, fetchCometData, transformNEOData, transformCometData } from '@/lib/api/neo'
import { analyzeImpactWithGemini } from '@/lib/api/gemini'
import { getOrbitClassInfo, getOrbitClassColor, getOrbitClassBgColor, getOrbitClassDescription, ORBIT_CLASSES } from '@/lib/utils/orbitClasses'

interface NEOObject {
  id: string
  name: string
  type: 'asteroid' | 'comet'
  diameter: number
  velocity: number
  missDistance: number
  approachDate: string
  isHazardous: boolean
  magnitude: number
  orbitClass: string
  lastObserved: string
  nextApproach: string
}

interface NEOClientProps {
  // Empty interface for future props
}

export default function NEOClient({}: NEOClientProps) {
  const [objects, setObjects] = useState<NEOObject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'asteroid' | 'comet'>('all')
  const [filterHazardous, setFilterHazardous] = useState<'all' | 'hazardous' | 'safe'>('all')
  const [filterOrbitClass, setFilterOrbitClass] = useState<string>('all')
  const [sortField, setSortField] = useState<keyof NEOObject>('missDistance')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [aiAnalysis, setAiAnalysis] = useState<string>('')
  const [analyzing, setAnalyzing] = useState(false)
  
  const itemsPerPage = 25

  // Fetch real data from APIs
  useEffect(() => {
    const loadNEOData = async () => {
      setLoading(true)
      try {
        // Use Promise.allSettled to handle individual API failures gracefully
        const [asteroidResult, cometResult] = await Promise.allSettled([
          fetchNEOData(),
          fetchCometData()
        ])
        
        // Handle asteroid data
        const transformedAsteroids = asteroidResult.status === 'fulfilled' 
          ? transformNEOData(asteroidResult.value) 
          : []
        
        // Handle comet data
        const transformedComets = cometResult.status === 'fulfilled' 
          ? transformCometData(cometResult.value) 
          : []
        
        // Combine both types of objects
        const allObjects = [...transformedAsteroids, ...transformedComets]
        
        setObjects(allObjects)
        
      } catch (error) {
        console.error('Error loading NEO data:', error)
        setObjects([])
      } finally {
        setLoading(false)
      }
    }

    // Only load data on client side to prevent hydration issues
    if (typeof window !== 'undefined') {
      loadNEOData()
    }
  }, [])

  const runAiAnalysis = async () => {
    try {
      setAnalyzing(true)
      const analysisData = {
        objects: objects.map(obj => ({
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

  // Filter and sort data
  const filteredAndSortedObjects = useMemo(() => {
    const filtered = objects.filter(obj => {
      const matchesSearch = obj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           obj.orbitClass.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === 'all' || obj.type === filterType
      const matchesHazardous = filterHazardous === 'all' || 
                              (filterHazardous === 'hazardous' && obj.isHazardous) ||
                              (filterHazardous === 'safe' && !obj.isHazardous)
      const matchesOrbitClass = filterOrbitClass === 'all' || 
                               getOrbitClassInfo(obj.orbitClass).name === filterOrbitClass
      
      return matchesSearch && matchesType && matchesHazardous && matchesOrbitClass
    })

    // Sort data
    filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      return 0
    })

    return filtered
  }, [objects, searchTerm, filterType, filterHazardous, filterOrbitClass, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedObjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedObjects = filteredAndSortedObjects.slice(startIndex, startIndex + itemsPerPage)

  // Real-time risk assessment based on NASA data
  const generateRiskAssessment = () => {
    const hazardousCount = objects.filter(obj => obj.isHazardous).length
    const closestApproach = Math.min(...objects.map(obj => obj.missDistance))
    const totalObjects = objects.length
    
    let riskLevel = 'Low'
    // Only use "Critical" for objects that would definitely impact Earth (extremely rare)
    if (closestApproach < 0.001) {
      riskLevel = 'Critical'
    } else if (hazardousCount > 3 || closestApproach < 0.05) {
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

  const handleSort = (field: keyof NEOObject) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const formatDistance = (distance: number) => {
    return distance.toFixed(4) + ' AU'
  }

  const formatDiameter = (diameter: number) => {
    return diameter.toFixed(1) + ' m'
  }

  const formatVelocity = (velocity: number) => {
    return velocity.toFixed(1) + ' km/s'
  }

  return (
    <div className="min-h-screen nasa-bg">
      <Navigation />
      
      <div className="max-w-7xl 2xl:max-w-[140rem] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 sm:py-12 relative z-10">
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
              <Globe className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent mb-4"
            >
              Asteroid Watch
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-base sm:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-gray-300 max-w-2xl xl:max-w-4xl 2xl:max-w-5xl mx-auto mb-6 sm:mb-8"
            >
              Monitor asteroids and comets approaching Earth with real-time NASA data and AI-powered impact analysis
            </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex justify-center"
          >
            <motion.button
              onClick={runAiAnalysis}
              disabled={analyzing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3 disabled:opacity-50 glow-purple"
            >
              <Zap className="w-6 h-6" />
              <span>{analyzing ? 'Analyzing...' : 'AI Impact Analysis'}</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12"
        >
          {[
            { title: 'Total Objects', value: objects.length, icon: Globe, color: 'from-blue-500 to-blue-600' },
            { title: 'Hazardous', value: objects.filter(o => o.isHazardous).length, icon: AlertTriangle, color: 'from-red-500 to-red-600' },
            { title: 'Asteroids', value: objects.filter(o => o.type === 'asteroid').length, icon: TrendingUp, color: 'from-orange-500 to-orange-600' },
            { title: 'Comets', value: objects.filter(o => o.type === 'comet').length, icon: Activity, color: 'from-indigo-500 to-indigo-600' }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 hover:shadow-2xl transition-all duration-300 shadow-lg glow-blue"
            >
              <div className="flex items-center justify-between mb-6">
                <motion.div 
                  className={`p-4 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </motion.div>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">{stat.value}</h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-300 font-medium">{stat.title}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg mb-6 sm:mb-8 glow-blue"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex-1 min-w-0 sm:min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search by name or orbit class..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-3 bg-black/20 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-300 placeholder-gray-400 text-sm sm:text-base"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 sm:gap-4">
            
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'asteroid' | 'comet')}
                className="bg-black/20 border border-cyan-500/30 rounded-lg px-3 py-2 text-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm sm:text-base min-w-32"
              >
                <option value="all">All Types</option>
                <option value="asteroid">Asteroids Only</option>
                <option value="comet">Comets Only</option>
              </select>
              
              <select
                value={filterHazardous}
                onChange={(e) => setFilterHazardous(e.target.value as 'all' | 'hazardous' | 'safe')}
                className="bg-black/20 border border-cyan-500/30 rounded-lg px-3 py-2 text-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm sm:text-base min-w-32"
              >
                <option value="all">All Objects</option>
                <option value="hazardous">Hazardous Only</option>
                <option value="safe">Safe Only</option>
              </select>
              
              <select
                value={filterOrbitClass}
                onChange={(e) => setFilterOrbitClass(e.target.value)}
                className="bg-black/20 border border-cyan-500/30 rounded-lg px-3 py-2 text-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm sm:text-base min-w-36"
              >
                <option value="all">All Orbit Classes</option>
                {Object.values(ORBIT_CLASSES).map((orbitClass) => (
                  <option key={orbitClass.name} value={orbitClass.name}>
                    {orbitClass.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>


        {/* Real-Time Risk Assessment */}
        {!loading && objects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 mb-6 glow-blue"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Activity className="w-6 h-6 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">
                  {aiAnalysis ? 'AI Risk Assessment' : 'Real-Time Risk Assessment'}
                </h3>
              </div>
              {aiAnalysis && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-purple-400 text-sm font-semibold">AI Active</span>
                </div>
              )}
            </div>
            {aiAnalysis ? (
              <AIResponse 
                content={aiAnalysis} 
                title="AI Impact Analysis"
                type="analysis"
                className="mb-4"
              />
            ) : (
              <div>
                {(() => {
                  const assessment = generateRiskAssessment()
                  return (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1">Risk Level</div>
                        <div className={`text-xl font-bold ${
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
                        <div className="text-xl font-bold text-white">{assessment.hazardousCount}</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1">Closest Approach</div>
                        <div className="text-xl font-bold text-cyan-400">{assessment.closestApproach.toFixed(4)} AU</div>
                      </div>
                    </div>
                  )
                })()}
                <div className="text-center mt-4">
                  <p className="text-gray-400 text-sm">Click &quot;AI Impact Analysis&quot; above for advanced threat assessment</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg glow-blue"
        >
          <div className="table-container overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr>
                  <th>
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center space-x-1 hover:text-cyan-400 text-gray-300 text-xs sm:text-sm"
                    >
                      <span>Name</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th>
                    <button
                      onClick={() => handleSort('type')}
                      className="flex items-center space-x-1 hover:text-cyan-400 text-gray-300 text-xs sm:text-sm"
                    >
                      <span>Type</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th>
                    <button
                      onClick={() => handleSort('diameter')}
                      className="flex items-center space-x-1 hover:text-cyan-400 text-gray-300 text-xs sm:text-sm"
                    >
                      <span>Diameter</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th>
                    <button
                      onClick={() => handleSort('velocity')}
                      className="flex items-center space-x-1 hover:text-cyan-400 text-gray-300 text-xs sm:text-sm"
                    >
                      <span>Velocity</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th>
                    <button
                      onClick={() => handleSort('missDistance')}
                      className="flex items-center space-x-1 hover:text-cyan-400 text-gray-300 text-xs sm:text-sm"
                    >
                      <span>Miss Distance</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th>
                    <button
                      onClick={() => handleSort('approachDate')}
                      className="flex items-center space-x-1 hover:text-cyan-400 text-gray-300 text-xs sm:text-sm"
                    >
                      <span>Approach Date</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-gray-300 text-xs sm:text-sm">Status</th>
                  <th>
                    <button
                      onClick={() => handleSort('orbitClass')}
                      className="flex items-center space-x-1 hover:text-cyan-400 text-gray-300 text-xs sm:text-sm"
                    >
                      <span>Orbit Class</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">
                      Loading Near Earth Objects...
                    </td>
                  </tr>
                ) : paginatedObjects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">
                      No objects found matching your criteria
                    </td>
                  </tr>
                ) : (
                  paginatedObjects.map((obj) => (
                    <tr key={obj.id} className="hover:bg-hover cursor-pointer" onClick={() => window.open(`/asteroid/${obj.id}`, '_blank')}>
                      <td className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors text-xs sm:text-sm">
                        <div className="truncate max-w-[120px] sm:max-w-none" title={`Click to view details for ${obj.name}`}>
                          {obj.name}
                        </div>
                      </td>
                      <td>
                        <span className={`badge text-xs ${obj.type === 'asteroid' ? 'badge-info' : 'badge-warning'}`}>
                          {obj.type}
                        </span>
                      </td>
                      <td className="text-gray-300 text-xs sm:text-sm">{formatDiameter(obj.diameter)}</td>
                      <td className="text-gray-300 text-xs sm:text-sm">{formatVelocity(obj.velocity)}</td>
                      <td className="font-mono text-gray-300 text-xs sm:text-sm">{formatDistance(obj.missDistance)}</td>
                      <td className="text-gray-300 text-xs sm:text-sm">
                        <div className="truncate max-w-[80px] sm:max-w-none" title={obj.approachDate}>
                          {obj.approachDate}
                        </div>
                      </td>
                      <td>
                        <span className={`badge text-xs ${obj.isHazardous ? 'badge-danger' : 'badge-success'}`}>
                          {obj.isHazardous ? 'Hazardous' : 'Safe'}
                        </span>
                      </td>
                      <td>
                        {(() => {
                          const orbitInfo = getOrbitClassInfo(obj.orbitClass)
                          return (
                            <div className="flex flex-col min-w-[100px]">
                              <span className={`text-xs sm:text-sm font-medium ${orbitInfo.color}`}>
                                {orbitInfo.name}
                              </span>
                              <span className="text-xs text-gray-500 truncate max-w-32 hidden sm:block" title={orbitInfo.description}>
                                {orbitInfo.description}
                              </span>
                            </div>
                          )
                        })()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-400">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedObjects.length)} of {filteredAndSortedObjects.length} objects
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === totalPages || 
                    Math.abs(page - currentPage) <= 2
                  )
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 border rounded-lg ${
                          currentPage === page
                            ? 'bg-cyan-500 text-white border-cyan-500'
                            : 'border-cyan-500/30 hover:bg-cyan-500/10 text-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
