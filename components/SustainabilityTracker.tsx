'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Leaf, 
  TreePine, 
  Zap, 
  Droplets, 
  Award,
  TrendingUp,
  Users,
  Car,
  Target,
  CheckCircle
} from 'lucide-react'

interface SustainabilityStats {
  co2Saved: number // in kg
  fuelSaved: number // in liters
  moneySaved: number // in currency
  treesEquivalent: number
  ridesShared: number
  kmShared: number
  carbonFootprint: number
  greenScore: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
  target: number
}

export default function SustainabilityTracker({ userId }: { userId: string }) {
  const [stats, setStats] = useState<SustainabilityStats>({
    co2Saved: 0,
    fuelSaved: 0,
    moneySaved: 0,
    treesEquivalent: 0,
    ridesShared: 0,
    kmShared: 0,
    carbonFootprint: 0,
    greenScore: 0
  })
  
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month')

  useEffect(() => {
    fetchSustainabilityData()
  }, [userId, selectedPeriod])

  const fetchSustainabilityData = async () => {
    setIsLoading(true)
    
    // Simulate API call - in real app, this would fetch from backend
    setTimeout(() => {
      const mockStats: SustainabilityStats = {
        co2Saved: 127.5,
        fuelSaved: 54.2,
        moneySaved: 4350,
        treesEquivalent: 5.8,
        ridesShared: 23,
        kmShared: 1847,
        carbonFootprint: 89.3,
        greenScore: 92
      }
      
      const mockAchievements: Achievement[] = [
        {
          id: 'eco_warrior',
          title: 'Eco Warrior',
          description: 'Save 100kg of CO2 emissions',
          icon: '🌍',
          unlocked: true,
          progress: 127.5,
          target: 100
        },
        {
          id: 'tree_hugger',
          title: 'Tree Hugger',
          description: 'Plant equivalent of 10 trees',
          icon: '🌳',
          unlocked: false,
          progress: 5.8,
          target: 10
        },
        {
          id: 'fuel_saver',
          title: 'Fuel Saver',
          description: 'Save 100 liters of fuel',
          icon: '⛽',
          unlocked: false,
          progress: 54.2,
          target: 100
        },
        {
          id: 'green_commuter',
          title: 'Green Commuter',
          description: 'Complete 50 shared rides',
          icon: '🚗',
          unlocked: false,
          progress: 23,
          target: 50
        }
      ]
      
      setStats(mockStats)
      setAchievements(mockAchievements)
      setIsLoading(false)
    }, 1500)
  }

  const getGreenScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 70) return 'text-blue-600 bg-blue-100'
    if (score >= 50) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const formatNumber = (num: number, decimals = 1) => {
    return num.toLocaleString('en-IN', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    })
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Leaf className="w-6 h-6 text-green-600 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Environmental Impact</h3>
            <p className="text-sm text-gray-600">Calculating your green footprint...</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
          <div className="p-2 bg-green-100 rounded-lg">
            <Leaf className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Environmental Impact</h3>
            <p className="text-sm text-gray-600">Your contribution to a greener planet</p>
          </div>
        </div>
        
        <div className={`px-3 py-2 rounded-full text-sm font-bold ${getGreenScoreColor(stats.greenScore)}`}>
          Green Score: {stats.greenScore}
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'week', label: 'This Week' },
          { id: 'month', label: 'This Month' },
          { id: 'year', label: 'This Year' },
          { id: 'all', label: 'All Time' }
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setSelectedPeriod(id as any)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === id
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Impact Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 rounded-lg p-4 text-center"
        >
          <div className="p-2 bg-green-100 rounded-full w-fit mx-auto mb-2">
            <Leaf className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-700 mb-1">
            {formatNumber(stats.co2Saved)}kg
          </div>
          <div className="text-sm text-green-600">CO₂ Saved</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-50 rounded-lg p-4 text-center"
        >
          <div className="p-2 bg-blue-100 rounded-full w-fit mx-auto mb-2">
            <Droplets className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700 mb-1">
            {formatNumber(stats.fuelSaved)}L
          </div>
          <div className="text-sm text-blue-600">Fuel Saved</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-purple-50 rounded-lg p-4 text-center"
        >
          <div className="p-2 bg-purple-100 rounded-full w-fit mx-auto mb-2">
            <TreePine className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700 mb-1">
            {formatNumber(stats.treesEquivalent)}
          </div>
          <div className="text-sm text-purple-600">Trees Planted</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-yellow-50 rounded-lg p-4 text-center"
        >
          <div className="p-2 bg-yellow-100 rounded-full w-fit mx-auto mb-2">
            <TrendingUp className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-700 mb-1">
            ₹{formatNumber(stats.moneySaved, 0)}
          </div>
          <div className="text-sm text-yellow-600">Money Saved</div>
        </motion.div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-600" />
            <div>
              <div className="text-lg font-semibold text-gray-900">{stats.ridesShared}</div>
              <div className="text-sm text-gray-600">Rides Shared</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Car className="w-5 h-5 text-gray-600" />
            <div>
              <div className="text-lg font-semibold text-gray-900">{formatNumber(stats.kmShared, 0)} km</div>
              <div className="text-sm text-gray-600">Distance Shared</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-gray-600" />
            <div>
              <div className="text-lg font-semibold text-gray-900">{formatNumber(stats.carbonFootprint)}kg</div>
              <div className="text-sm text-gray-600">Carbon Footprint</div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-yellow-500" />
          <h4 className="text-lg font-semibold text-gray-900">Green Achievements</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`border rounded-lg p-4 ${
                achievement.unlocked 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-semibold text-gray-900">{achievement.title}</h5>
                    {achievement.unlocked && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">
                    {formatNumber(achievement.progress)} / {achievement.target}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      achievement.unlocked ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ 
                      width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-green-600" />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">Keep Going Green! 🌱</h4>
            <p className="text-sm text-gray-600">
              Share more rides to increase your environmental impact and unlock new achievements.
            </p>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
            Share a Ride
          </button>
        </div>
      </div>
    </div>
  )
}
