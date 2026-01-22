'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  Users, 
  MapPin, 
  Clock, 
  Star,
  Zap,
  Target,
  ArrowRight
} from 'lucide-react'

interface SmartRecommendation {
  type: 'route' | 'time' | 'driver' | 'price'
  title: string
  description: string
  confidence: number
  savings?: number
  action: string
  data: any
}

interface AIRecommendationsProps {
  userId: string
  currentLocation?: { lat: number; lng: number }
  travelHistory?: any[]
  preferences?: any
}

export default function AIRecommendations({ 
  userId, 
  currentLocation, 
  travelHistory = [],
  preferences = {}
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'routes' | 'savings' | 'social'>('all')

  useEffect(() => {
    generateAIRecommendations()
  }, [userId, currentLocation, travelHistory])

  const generateAIRecommendations = async () => {
    setIsLoading(true)
    
    // Simulate AI processing
    setTimeout(() => {
      const smartRecommendations: SmartRecommendation[] = [
        {
          type: 'route',
          title: 'Popular Route Alert',
          description: 'Mumbai → Pune route has 40% more rides this weekend. Book early for better prices!',
          confidence: 92,
          savings: 250,
          action: 'Search Rides',
          data: { route: 'Mumbai-Pune', demand: 'high' }
        },
        {
          type: 'time',
          title: 'Optimal Departure Time',
          description: 'Leave at 7:30 AM instead of 8:00 AM to save ₹150 and avoid traffic.',
          confidence: 87,
          savings: 150,
          action: 'Adjust Time',
          data: { suggestedTime: '07:30', currentTime: '08:00' }
        },
        {
          type: 'driver',
          title: 'Highly Rated Driver',
          description: 'Rajesh (4.9★) frequently travels your route and offers great conversation!',
          confidence: 94,
          action: 'View Profile',
          data: { driverId: 'driver123', rating: 4.9, name: 'Rajesh' }
        },
        {
          type: 'price',
          title: 'Price Drop Alert',
          description: 'Prices for Delhi → Jaipur dropped by 20% this week. Perfect time to book!',
          confidence: 89,
          savings: 300,
          action: 'Book Now',
          data: { route: 'Delhi-Jaipur', discount: 20 }
        }
      ]
      
      setRecommendations(smartRecommendations)
      setIsLoading(false)
    }, 2000)
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'route': return <MapPin className="w-5 h-5" />
      case 'time': return <Clock className="w-5 h-5" />
      case 'driver': return <Users className="w-5 h-5" />
      case 'price': return <TrendingUp className="w-5 h-5" />
      default: return <Brain className="w-5 h-5" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100'
    if (confidence >= 80) return 'text-blue-600 bg-blue-100'
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  const filteredRecommendations = recommendations.filter(rec => {
    if (selectedCategory === 'all') return true
    if (selectedCategory === 'routes') return rec.type === 'route'
    if (selectedCategory === 'savings') return rec.savings && rec.savings > 0
    if (selectedCategory === 'social') return rec.type === 'driver'
    return true
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
            <p className="text-sm text-gray-600">Analyzing your travel patterns...</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
            <p className="text-sm text-gray-600">Personalized suggestions based on your travel patterns</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="text-gray-600">Smart Insights</span>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'all', label: 'All', icon: Target },
          { id: 'routes', label: 'Routes', icon: MapPin },
          { id: 'savings', label: 'Savings', icon: TrendingUp },
          { id: 'social', label: 'Social', icon: Users }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelectedCategory(id as any)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === id
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        {filteredRecommendations.map((rec, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                  {getRecommendationIcon(rec.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(rec.confidence)}`}>
                      {rec.confidence}% confident
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">{rec.description}</p>
                  
                  {rec.savings && (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-2">
                      <TrendingUp className="w-4 h-4" />
                      Save ₹{rec.savings}
                    </div>
                  )}
                </div>
              </div>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                {rec.action}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredRecommendations.length === 0 && (
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No recommendations available for this category.</p>
          <p className="text-sm text-gray-500 mt-1">Travel more to get personalized insights!</p>
        </div>
      )}

      {/* AI Insights Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>Based on {travelHistory.length || 0} previous trips</span>
          </div>
          <button className="text-purple-600 hover:text-purple-700 font-medium">
            View All Insights →
          </button>
        </div>
      </div>
    </div>
  )
}
