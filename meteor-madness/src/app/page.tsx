'use client'

import Navigation from '@/components/Navigation'
import { motion } from 'framer-motion'
import { Search, Eye, Target, Zap, AlertTriangle } from 'lucide-react'
import Image from 'next/image'

// Custom Logo Component
function LogoIcon({ className }: { className?: string }) {
  return (
    <Image 
      src="/logo.png" 
      alt="NEOWatch Logo" 
      width={32} 
      height={32} 
      className={className}
    />
  );
}

export default function Home() {
  return (
    <div className="min-h-screen nasa-bg">
      <Navigation />
      
      <div className="max-w-7xl 2xl:max-w-[140rem] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 sm:py-12 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 mb-6 shadow-lg"
          >
            <Image 
              src="/logo.png" 
              alt="NEOWatch Logo" 
              width={128} 
              height={128} 
              className="w-full h-full object-contain"
            />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent mb-6"
          >
            NEOWatch
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-lg sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl text-gray-300 max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto mb-8"
          >
            Track Near-Earth Objects with real-time NASA data and AI-powered analysis
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16"
        >
          {[
            {
              title: 'Asteroid Watch',
              description: 'Monitor Near-Earth Objects with real-time orbital data and impact analysis',
              icon: Eye,
              color: 'from-red-500 to-red-600',
              href: '/neo'
            },
            {
              title: 'Solar System 3D',
              description: 'Interactive 3D visualization of our solar system',
              icon: LogoIcon,
              color: 'from-orange-500 to-orange-600',
              href: '/solar-system'
            },
            {
              title: 'Dashboard',
              description: 'Comprehensive overview of space threats and monitoring data',
              icon: Zap,
              color: 'from-purple-500 to-purple-600',
              href: '/dashboard'
            }
          ].map((feature, index) => (
            <motion.a
              key={feature.title}
              href={feature.href}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 shadow-lg glow-blue"
            >
              <div className="flex items-center justify-between mb-6">
                <motion.div 
                  className={`p-4 rounded-xl bg-gradient-to-r ${feature.color} shadow-lg`}
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>
                <AlertTriangle className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-300 leading-relaxed">{feature.description}</p>
            </motion.a>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 shadow-lg glow-blue mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-white mb-8">
            Real-Time Space Monitoring
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Objects Monitored', value: '28,000+', icon: LogoIcon },
              { label: 'Hazardous Objects', value: '2,000+', icon: AlertTriangle },
              { label: 'Solar Objects', value: '1000+', icon: LogoIcon },
              { label: 'Data Sources', value: 'NASA JPL', icon: Search }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400 mx-auto mb-3" />
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm sm:text-base text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-center"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6">
            Explore the Cosmos
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join millions of space enthusiasts tracking asteroids and comets in real-time
          </p>
          <motion.a
            href="/neo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg glow-blue"
          >
            <Eye className="w-5 h-5 mr-2" />
            Start Tracking Asteroids
          </motion.a>
        </motion.div>
      </div>
    </div>
  )
}