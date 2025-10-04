'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Meteor {
  id: number
  x: number
  y: number
  delay: number
  duration: number
  size: number
}

export default function MeteorBackground() {
  const [meteors, setMeteors] = useState<Meteor[]>([])

  useEffect(() => {
    const generateMeteors = () => {
      const newMeteors: Meteor[] = []
      for (let i = 0; i < 50; i++) {
        newMeteors.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 20,
          duration: 3 + Math.random() * 4,
          size: Math.random() * 3 + 1,
        })
      }
      setMeteors(newMeteors)
    }

    generateMeteors()
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Meteors */}
      {meteors.map((meteor) => (
        <motion.div
          key={meteor.id}
          className="absolute"
          style={{
            left: `${meteor.x}%`,
            top: `${meteor.y}%`,
          }}
          initial={{
            opacity: 0,
            x: 0,
            y: 0,
          }}
          animate={{
            opacity: [0, 1, 0],
            x: [0, 300],
            y: [0, 300],
          }}
          transition={{
            duration: meteor.duration,
            delay: meteor.delay,
            repeat: Infinity,
            repeatDelay: 10 + Math.random() * 20,
          }}
        >
          <div
            className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
            style={{
              width: `${meteor.size}px`,
              height: `${meteor.size}px`,
              boxShadow: `0 0 ${meteor.size * 2}px ${meteor.size}px rgba(168, 85, 247, 0.3)`,
            }}
          />
          <div
            className="absolute top-0 left-0 bg-gradient-to-r from-purple-400 to-transparent"
            style={{
              width: `${meteor.size * 20}px`,
              height: `${meteor.size}px`,
              transform: 'rotate(45deg)',
              transformOrigin: 'left center',
            }}
          />
        </motion.div>
      ))}

      {/* Nebula Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168, 85, 247, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  )
}
