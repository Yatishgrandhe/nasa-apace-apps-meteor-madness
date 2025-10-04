'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Filter, Rocket, Target, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface Mission {
  id: string
  name: string
  status: 'active' | 'completed' | 'planned' | 'cancelled'
  launchDate: string
  target: string
  description: string
  progress: number
}

export default function MissionsClient() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const missions: Mission[] = [
    {
      id: '1',
      name: 'Asteroid Impact Deflection',
      status: 'active',
      launchDate: '2025-03-15',
      target: 'Asteroid 2023 DZ2',
      description: 'Kinetic impactor mission to test asteroid deflection technology',
      progress: 75
    },
    {
      id: '2',
      name: 'Comet Sample Return',
      status: 'planned',
      launchDate: '2025-08-20',
      target: 'Comet 67P/Churyumov-Gerasimenko',
      description: 'Sample return mission to study comet composition',
      progress: 30
    },
    {
      id: '3',
      name: 'NEO Survey Telescope',
      status: 'active',
      launchDate: '2025-01-10',
      target: 'Earth Orbit',
      description: 'Space-based telescope for near-Earth object detection',
      progress: 90
    },
    {
      id: '4',
      name: 'Asteroid Mining Probe',
      status: 'cancelled',
      launchDate: '2026-02-14',
      target: 'Asteroid Psyche',
      description: 'Preliminary mining technology demonstration',
      progress: 15
    }
  ]

  const filteredMissions = missions.filter(mission => {
    const matchesSearch = mission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mission.target.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || mission.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'completed': return 'text-blue-400'
      case 'planned': return 'text-yellow-400'
      case 'cancelled': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertCircle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'planned': return <Clock className="w-4 h-4" />
      case 'cancelled': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen nasa-bg">
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
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mb-6 glow-blue"
          >
            <Rocket className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Missions
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Track active space missions and asteroid deflection projects
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 mb-8 shadow-lg glow-blue"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search missions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/60 border border-cyan-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                />
              </div>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-black/60 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400 transition-all duration-300"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="planned">Planned</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 glow-blue"
            >
              <Plus className="w-5 h-5" />
              <span>New Mission</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Missions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredMissions.map((mission, index) => (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 shadow-lg glow-blue"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{mission.name}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-gray-300">{mission.target}</span>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-black/40 ${getStatusColor(mission.status)}`}>
                  {getStatusIcon(mission.status)}
                  <span className="text-xs font-medium capitalize">{mission.status}</span>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4 line-clamp-2">{mission.description}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Launch Date</span>
                  <span className="text-white">{new Date(mission.launchDate).toLocaleDateString()}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{mission.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${mission.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <button className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300">
                  View Details
                </button>
                <button className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300">
                  Edit
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredMissions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <Rocket className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No missions found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
