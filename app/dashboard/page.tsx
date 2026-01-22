'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Car, 
  Route, 
  Users, 
  Star, 
  Calendar,
  MapPin,
  Clock,
  Plus,
  Settings,
  Bell,
  Shield,
  TrendingUp,
  DollarSign,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'
import MapTracking from '@/components/MapTracking'
import SOSButton from '@/components/SOSButton'

interface DashboardStats {
  totalRides: number
  totalEarnings: number
  averageRating: number
  completedRides: number
  upcomingRides: number
  activeRides: number
}

interface RecentRide {
  _id: string
  origin: { city: string; address: string }
  destination: { city: string; address: string }
  departureTime: string
  status: 'upcoming' | 'active' | 'completed' | 'cancelled'
  passengers: number
  earnings: number
  rating?: number
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'rides' | 'earnings' | 'profile'>('overview')
  const [stats, setStats] = useState<DashboardStats>({
    totalRides: 0,
    totalEarnings: 0,
    averageRating: 5.0,
    completedRides: 0,
    upcomingRides: 0,
    activeRides: 0
  })
  const [recentRides, setRecentRides] = useState<RecentRide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    fetchDashboardData()
    getCurrentLocation()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setRecentRides(data.recentRides)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => console.error('Location error:', error)
      )
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Car className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">Chla Chla</span>
            </Link>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <Link href="/profile" className="p-2 text-gray-600 hover:text-gray-900">
                <Settings className="w-6 h-6" />
              </Link>
              <SOSButton userLocation={currentLocation || undefined} className="ml-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'rides', label: 'My Rides', icon: Route },
              { id: 'earnings', label: 'Earnings', icon: DollarSign },
              { id: 'profile', label: 'Profile', icon: Users }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Rides</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalRides}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Route className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalEarnings)}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Rating</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Rides</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeRides}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/publish"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Plus className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Publish a Ride</p>
                    <p className="text-sm text-gray-600">Share your journey</p>
                  </div>
                </Link>

                <Link
                  href="/search"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Find a Ride</p>
                    <p className="text-sm text-gray-600">Search available rides</p>
                  </div>
                </Link>

                <Link
                  href="/messages"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Messages</p>
                    <p className="text-sm text-gray-600">Chat with co-travelers</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Rides */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Rides</h3>
                <Link href="/rides" className="text-primary-600 hover:text-primary-700 font-medium">
                  View All
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentRides.length > 0 ? (
                  recentRides.slice(0, 5).map((ride) => (
                    <div key={ride._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Route className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {ride.origin.city} → {ride.destination.city}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(ride.departureTime).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {ride.passengers} passengers
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
                          {ride.status}
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {formatCurrency(ride.earnings)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Route className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No rides yet</p>
                    <Link href="/publish" className="text-primary-600 hover:text-primary-700 font-medium">
                      Publish your first ride
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content would go here */}
        {activeTab === 'rides' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Rides</h3>
            <p className="text-gray-600">Ride management features coming soon...</p>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings</h3>
            <p className="text-gray-600">Earnings analytics coming soon...</p>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
            <p className="text-gray-600">Profile management coming soon...</p>
          </div>
        )}
      </div>
    </div>
  )
}
