'use client'

import { motion } from 'framer-motion'
import { Brain, Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface AIResponseProps {
  content: string
  title?: string
  type?: 'analysis' | 'insight' | 'warning' | 'success'
  isLoading?: boolean
  className?: string
}

export default function AIResponse({ 
  content, 
  title = "AI Analysis", 
  type = 'analysis',
  isLoading = false,
  className = ""
}: AIResponseProps) {
  
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'insight':
        return <Info className="w-5 h-5 text-blue-400" />
      default:
        return <Brain className="w-5 h-5 text-purple-400" />
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case 'warning':
        return 'border-orange-500/30'
      case 'success':
        return 'border-green-500/30'
      case 'insight':
        return 'border-blue-500/30'
      default:
        return 'border-purple-500/30'
    }
  }

  const getGlowEffect = () => {
    switch (type) {
      case 'warning':
        return 'glow-orange'
      case 'success':
        return 'glow-green'
      case 'insight':
        return 'glow-blue'
      default:
        return 'glow-purple'
    }
  }

  // Parse content for better formatting with proper capitalization
  const formatContent = (text: string) => {
    if (!text) return ''
    
    // Improve text capitalization and formatting
    const improveText = (str: string) => {
      return str
        .replace(/\b\w/g, (char, index) => {
          // Don't capitalize if it's after a period and space (already capitalized)
          if (index > 0 && str[index - 1] === '.' && str[index - 2] === ' ') {
            return char
          }
          // Capitalize first letter of sentences
          if (index === 0 || (index > 1 && str[index - 2] === '.' && str[index - 1] === ' ')) {
            return char.toUpperCase()
          }
          return char
        })
        .replace(/\b(apollo|aten|amor|atira|halley-type|jupiter family|long period|short period)\b/gi, (match) => {
          const properNames: Record<string, string> = {
            'apollo': 'Apollo',
            'aten': 'Aten', 
            'amor': 'Amor',
            'atira': 'Atira',
            'halley-type': 'Halley-type',
            'jupiter family': 'Jupiter Family',
            'long period': 'Long Period',
            'short period': 'Short Period'
          }
          return properNames[match.toLowerCase()] || match
        })
        .replace(/\b(nasa|au|km\/s|asteroid|comet|earth|impact|risk|hazardous)\b/gi, (match) => {
          const properTerms: Record<string, string> = {
            'nasa': 'NASA',
            'au': 'AU',
            'km/s': 'km/s',
            'asteroid': 'asteroid',
            'comet': 'comet',
            'earth': 'Earth',
            'impact': 'impact',
            'risk': 'risk',
            'hazardous': 'hazardous'
          }
          return properTerms[match.toLowerCase()] || match
        })
    }
    
    // Split into paragraphs and clean up
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim())
    
    return paragraphs.map((paragraph, index) => {
      const trimmed = paragraph.trim()
      const improvedText = improveText(trimmed)
      
      // Check if it's a list item
      if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
        const items = trimmed.split('\n')
          .filter(item => item.trim().match(/^[-•*]\s/))
          .map(item => {
            const cleanItem = item.replace(/^[-•*]\s/, '').trim()
            return improveText(cleanItem)
          })
        
        return (
          <ul key={index} className="space-y-2 my-3">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-300 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        )
      }
      
      // Check if it's a header
      if (trimmed.match(/^[A-Z][A-Z\s]+:$/) || trimmed.endsWith(':')) {
        return (
          <h4 key={index} className="text-lg font-semibold text-white mt-4 mb-2 first:mt-0">
            {improvedText.replace(':', '')}
          </h4>
        )
      }
      
      // Regular paragraph
      return (
        <p key={index} className="text-gray-300 leading-relaxed mb-3 last:mb-0">
          {improvedText}
        </p>
      )
    })
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 shadow-lg ${getGlowEffect()} ${className}`}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
            <Brain className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Analysis in Progress</h3>
            <p className="text-sm text-gray-400">Processing data with advanced algorithms...</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="w-24 h-2 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-32 h-2 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <div className="w-28 h-2 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-black/40 backdrop-blur-sm border ${getBorderColor()} rounded-2xl p-6 shadow-lg ${getGlowEffect()} ${className}`}
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
          {getIcon()}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-purple-400 text-sm font-medium">AI Powered</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        {formatContent(content)}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-500">Generated by AI • Updated just now</span>
          </div>
          <div className="text-xs text-gray-600">
            Powered by Gemini AI
          </div>
        </div>
      </div>
    </motion.div>
  )
}
