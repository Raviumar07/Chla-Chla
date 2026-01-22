'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Filter,
  Star,
  Clock,
  Car,
  Shield,
  ArrowRight,
  User,
  MessageCircle,
  Phone
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface SearchFilters {
  origin: string
  destination: string
  date: string
  passengers: number
  maxPrice: number
  departureTime: string
  preferences: {
    smokingAllowed: boolean
    petsAllowed: boolean
    instantBooking: boolean
  }
}

interface Ride {
  _id: string
  driver: {
    _id: string
    firstName: string
    lastName: string
    profilePicture?: string
    rating: number
    totalRides: number
    isVerified: boolean
  }
  vehicle: {
    make: string
    model: string
    color: string
    vehicleType: string
  }
  origin: {
    address: string
    city: string
  }
  destination: {
    address: string
    city: string
  }
  departureTime: string
  estimatedArrivalTime: string
  availableSeats: number
  pricePerSeat: number
  distance: number
  estimatedDuration: number
  preferences: {
    smokingAllowed: boolean
    petsAllowed: boolean
    instantBooking: boolean
  }
  description?: string
}

export default function SearchPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    origin: '',
    destination: '',
    date: '',
    passengers: 1,
    maxPrice: 2000,
    departureTime: '',
    preferences: {
      smokingAllowed: false,
      petsAllowed: false,
      instantBooking: false
    }
  })
  
  const [rides, setRides] = useState<Ride[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'price' | 'time' | 'rating'>('price')

  const searchRides = async () => {
    if (!filters.origin || !filters.destination) {
      toast.error('Please enter origin and destination')
      return
    }

    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams({
        origin: filters.origin,
        destination: filters.destination,
        date: filters.date,
        passengers: filters.passengers.toString(),
        maxPrice: filters.maxPrice.toString(),
        sortBy: sortBy
      })

      const response = await fetch(`/api/rides/search?${queryParams}`)
      const data = await response.json()

      if (response.ok) {
        setRides(data.rides)
        if (data.rides.length === 0) {
          toast.error('No rides found for your search criteria')
        }
      } else {
        throw new Error(data.message || 'Search failed')
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Failed to search rides')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const calculateArrivalTime = (departureTime: string, duration: number) => {
    const departure = new Date(departureTime)
    const arrival = new Date(departure.getTime() + duration * 60000)
    return arrival.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
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
              <Link href="/publish" className="btn-secondary">
                Publish a Ride
              </Link>
              <Link href="/dashboard" className="btn-primary">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Find Your Perfect Ride</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="From (City)"
                value={filters.origin}
                onChange={(e) => handleFilterChange('origin', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="To (City)"
                value={filters.destination}
                onChange={(e) => handleFilterChange('destination', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filters.passengers}
                onChange={(e) => handleFilterChange('passengers', parseInt(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value={1}>1 Passenger</option>
                <option value={2}>2 Passengers</option>
                <option value={3}>3 Passengers</option>
                <option value={4}>4 Passengers</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price' | 'time' | 'rating')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="price">Sort by Price</option>
                <option value="time">Sort by Time</option>
                <option value="rating">Sort by Rating</option>
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={searchRides}
              disabled={isLoading}
              className="btn-primary flex items-center gap-2 px-8 py-3"
            >
              {isLoading ? (
                <div className="spinner" />
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search Rides
                </>
              )}
            </motion.button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price per Seat: ₹{filters.maxPrice}
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure Time
                  </label>
                  <input
                    type="time"
                    value={filters.departureTime}
                    onChange={(e) => handleFilterChange('departureTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferences
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.preferences.smokingAllowed}
                        onChange={(e) => handleFilterChange('preferences', {
                          ...filters.preferences,
                          smokingAllowed: e.target.checked
                        })}
                        className="mr-2"
                      />
                      Smoking Allowed
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.preferences.petsAllowed}
                        onChange={(e) => handleFilterChange('preferences', {
                          ...filters.preferences,
                          petsAllowed: e.target.checked
                        })}
                        className="mr-2"
                      />
                      Pets Allowed
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.preferences.instantBooking}
                        onChange={(e) => handleFilterChange('preferences', {
                          ...filters.preferences,
                          instantBooking: e.target.checked
                        })}
                        className="mr-2"
                      />
                      Instant Booking
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Search Results */}
        <div className="space-y-4">
          {rides.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {rides.length} ride{rides.length !== 1 ? 's' : ''} found
              </h2>
            </div>
          )}

          {rides.map((ride) => (
            <motion.div
              key={ride._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                {/* Left Section - Route & Time */}
                <div className="flex-1 mb-4 lg:mb-0">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatTime(ride.departureTime)}
                      </div>
                      <div className="text-sm text-gray-500">{ride.origin.city}</div>
                    </div>
                    
                    <div className="flex-1 flex items-center">
                      <div className="w-full border-t-2 border-gray-300 relative">
                        <Car className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-primary-600 w-6 h-6" />
                      </div>
                      <div className="text-xs text-gray-500 mx-2">
                        {formatDuration(ride.estimatedDuration)}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {calculateArrivalTime(ride.departureTime, ride.estimatedDuration)}
                      </div>
                      <div className="text-sm text-gray-500">{ride.destination.city}</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    {ride.origin.address} → {ride.destination.address}
                  </div>
                  
                  {ride.description && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {ride.description}
                    </div>
                  )}
                </div>

                {/* Middle Section - Driver & Vehicle */}
                <div className="flex items-center space-x-4 mb-4 lg:mb-0 lg:mx-8">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      {ride.driver.profilePicture ? (
                        <img
                          src={ride.driver.profilePicture}
                          alt={`${ride.driver.firstName} ${ride.driver.lastName}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-primary-600" />
                        </div>
                      )}
                      {ride.driver.isVerified && (
                        <Shield className="absolute -top-1 -right-1 w-5 h-5 text-green-500 bg-white rounded-full" />
                      )}
                    </div>
                    
                    <div>
                      <div className="font-semibold text-gray-900">
                        {ride.driver.firstName} {ride.driver.lastName}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          {ride.driver.rating.toFixed(1)}
                        </div>
                        <span>•</span>
                        <span>{ride.driver.totalRides} rides</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {ride.vehicle.color} {ride.vehicle.make} {ride.vehicle.model}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section - Price & Booking */}
                <div className="flex flex-col items-end space-y-3">
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary-600">
                      ₹{ride.pricePerSeat}
                    </div>
                    <div className="text-sm text-gray-500">per seat</div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{ride.availableSeats} seats left</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <MessageCircle className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Phone className="w-5 h-5 text-gray-600" />
                    </button>
                    <Link
                      href={`/ride/${ride._id}`}
                      className="btn-primary flex items-center gap-2 px-6 py-2"
                    >
                      Book Now
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Preferences Tags */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                {ride.preferences.instantBooking && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Instant Booking
                  </span>
                )}
                {ride.preferences.smokingAllowed && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    Smoking OK
                  </span>
                )}
                {ride.preferences.petsAllowed && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Pets OK
                  </span>
                )}
              </div>
            </motion.div>
          ))}

          {rides.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No rides found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or check back later for new rides.
              </p>
              <Link href="/publish" className="btn-primary">
                Publish Your Own Ride
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
