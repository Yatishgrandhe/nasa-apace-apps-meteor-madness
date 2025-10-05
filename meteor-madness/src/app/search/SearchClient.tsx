'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Globe, Target, AlertTriangle, Clock, Filter } from 'lucide-react'
import Navigation from '@/components/Navigation'
import { fetchNEOData, fetchCometData, transformNEOData, transformCometData, type NEOObject, type CometObject } from '@/lib/api/neo'
import { getOrbitClassInfo } from '@/lib/utils/orbitClasses'

interface SearchClientProps {
  // Empty interface for future props
}

export default function SearchClient({}: SearchClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [neoData, setNeoData] = useState<NEOObject[]>([])
  const [cometData, setCometData] = useState<CometObject[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<'all' | 'asteroid' | 'comet'>('all')
  const [filterHazardous, setFilterHazardous] = useState<'all' | 'hazardous' | 'safe'>('all')

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [neoResponse, cometResponse] = await Promise.allSettled([
          fetchNEOData(),
          fetchCometData()
        ])
        
        const transformedNEO = neoResponse.status === 'fulfilled' 
          ? transformNEOData(neoResponse.value) 
          : []
        const transformedComets = cometResponse.status === 'fulfilled' 
          ? transformCometData(cometResponse.value) 
          : []
        
        setNeoData(transformedNEO)
        setCometData(transformedComets)
        
      } catch (error) {
        console.error('Error loading data:', error)
        setNeoData([])
        setCometData([])
      } finally {
        setLoading(false)
      }
    }

    if (typeof window !== 'undefined') {
      loadData()
    }
  }, [])

  const allObjects = useMemo(() => {
    return [
      ...neoData.map(obj => ({ ...obj, type: 'asteroid' as const })),
      ...cometData.map(obj => ({ ...obj, type: 'comet' as const }))
    ]
  }, [neoData, cometData])

  const filteredObjects = useMemo(() => {
    return allObjects.filter(obj => {
      const matchesSearch = obj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           obj.orbitClass?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === 'all' || obj.type === filterType
      const matchesHazardous = filterType === 'comet' || 
                              filterHazardous === 'all' ||
                              (filterHazardous === 'hazardous' && obj.isHazardous) ||
                              (filterHazardous === 'safe' && !obj.isHazardous)

      return matchesSearch && matchesType && matchesHazardous
    })
  }, [allObjects, searchTerm, filterType, filterHazardous])

  const formatDiameter = (diameter: number) => {
    if (diameter < 1) {
      return `${(diameter * 1000).toFixed(0)} m`
    }
    return `${diameter.toFixed(2)} km`
  }

  const formatVelocity = (velocity: number) => {
    return `${velocity.toFixed(2)} km/s`
  }

  const formatDistance = (distance: number) => {
    return `${distance.toFixed(6)} AU`
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
            <Search className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent mb-4"
          >
            Search Objects
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-base sm:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-gray-300 max-w-2xl xl:max-w-4xl 2xl:max-w-5xl mx-auto mb-6 sm:mb-8"
          >
            Search and explore asteroids, comets, and space objects in our solar system
          </motion.p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg mb-8 glow-blue"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex-1 min-w-0 sm:min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search by name, orbit class, or designation..."
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
                <option value="asteroid">Asteroids</option>
                <option value="comet">Comets</option>
              </select>
              
              <select
                value={filterHazardous}
                onChange={(e) => setFilterHazardous(e.target.value as 'all' | 'hazardous' | 'safe')}
                className="bg-black/20 border border-cyan-500/30 rounded-lg px-3 py-2 text-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm sm:text-base min-w-32"
              >
                <option value="all">All Objects</option>
                <option value="hazardous">Hazardous</option>
                <option value="safe">Safe</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg glow-blue"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
              Search Results
            </h2>
            <span className="text-gray-400 text-sm sm:text-base">
              {loading ? 'Loading...' : `${filteredObjects.length} objects found`}
            </span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-800/50 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : filteredObjects.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No objects found matching your search criteria</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search terms or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr>
                    <th className="text-left text-gray-300 text-xs sm:text-sm py-3">Name</th>
                    <th className="text-left text-gray-300 text-xs sm:text-sm py-3">Type</th>
                    <th className="text-left text-gray-300 text-xs sm:text-sm py-3">Diameter</th>
                    <th className="text-left text-gray-300 text-xs sm:text-sm py-3">Velocity</th>
                    <th className="text-left text-gray-300 text-xs sm:text-sm py-3">Miss Distance</th>
                    <th className="text-left text-gray-300 text-xs sm:text-sm py-3">Status</th>
                    <th className="text-left text-gray-300 text-xs sm:text-sm py-3">Orbit Class</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredObjects.slice(0, 100).map((obj) => (
                    <tr key={obj.id} className="hover:bg-hover border-b border-gray-800">
                      <td className="font-medium text-gray-300 text-xs sm:text-sm py-3">
                        <div className="truncate max-w-[120px] sm:max-w-none" title={obj.name}>
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
                      <td>
                        <span className={`badge text-xs ${obj.isHazardous ? 'badge-danger' : 'badge-success'}`}>
                          {obj.isHazardous ? 'Hazardous' : 'Safe'}
                        </span>
                      </td>
                      <td>
                        {(() => {
                          const orbitInfo = getOrbitClassInfo(obj.orbitClass || 'Unknown')
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
