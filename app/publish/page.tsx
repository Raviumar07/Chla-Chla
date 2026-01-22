'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign,
  Car,
  Plus,
  Minus,
  Info,
  ArrowRight,
  Route,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface RideData {
  origin: {
    address: string
    city: string
    state: string
    coordinates: { lat: number; lng: number }
  }
  destination: {
    address: string
    city: string
    state: string
    coordinates: { lat: number; lng: number }
  }
  waypoints: Array<{
    address: string
    city: string
    coordinates: { lat: number; lng: number }
  }>
  departureDate: string
  departureTime: string
  availableSeats: number
  pricePerSeat: number
  vehicleId: string
  description: string
  preferences: {
    smokingAllowed: boolean
    petsAllowed: boolean
    maxTwoInBack: boolean
    instantBooking: boolean
  }
}

interface Vehicle {
  _id: string
  make: string
  model: string
  year: number
  color: string
  licensePlate: string
  vehicleType: string
  seats: number
}

export default function PublishRidePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [rideData, setRideData] = useState<RideData>({
    origin: {
      address: '',
      city: '',
      state: '',
      coordinates: { lat: 0, lng: 0 }
    },
    destination: {
      address: '',
      city: '',
      state: '',
      coordinates: { lat: 0, lng: 0 }
    },
    waypoints: [],
    departureDate: '',
    departureTime: '',
    availableSeats: 1,
    pricePerSeat: 0,
    vehicleId: '',
    description: '',
    preferences: {
      smokingAllowed: false,
      petsAllowed: false,
      maxTwoInBack: false,
      instantBooking: true
    }
  })

  useEffect(() => {
    fetchUserVehicles()
  }, [])

  const fetchUserVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles/my-vehicles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      const data = await response.json()
      
      if (response.ok) {
        setVehicles(data.vehicles)
        if (data.vehicles.length > 0) {
          setRideData(prev => ({ ...prev, vehicleId: data.vehicles[0]._id }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setRideData(prev => ({ ...prev, [field]: value }))
  }

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setRideData(prev => {
      const parentObj = prev[parent as keyof RideData]
      if (typeof parentObj === 'object' && parentObj !== null) {
        return {
          ...prev,
          [parent]: { ...parentObj, [field]: value }
        }
      }
      return prev
    })
  }

  const addWaypoint = () => {
    setRideData(prev => ({
      ...prev,
      waypoints: [...prev.waypoints, {
        address: '',
        city: '',
        coordinates: { lat: 0, lng: 0 }
      }]
    }))
  }

  const removeWaypoint = (index: number) => {
    setRideData(prev => ({
      ...prev,
      waypoints: prev.waypoints.filter((_, i) => i !== index)
    }))
  }

  const updateWaypoint = (index: number, field: string, value: any) => {
    setRideData(prev => ({
      ...prev,
      waypoints: prev.waypoints.map((waypoint, i) => 
        i === index ? { ...waypoint, [field]: value } : waypoint
      )
    }))
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!rideData.origin.address || !rideData.destination.address) {
          toast.error('Please enter both origin and destination')
          return false
        }
        break
      case 2:
        if (!rideData.departureDate || !rideData.departureTime) {
          toast.error('Please select departure date and time')
          return false
        }
        const departureDateTime = new Date(`${rideData.departureDate}T${rideData.departureTime}`)
        if (departureDateTime <= new Date()) {
          toast.error('Departure time must be in the future')
          return false
        }
        break
      case 3:
        if (!rideData.vehicleId) {
          toast.error('Please select a vehicle')
          return false
        }
        if (rideData.availableSeats < 1) {
          toast.error('At least 1 seat must be available')
          return false
        }
        if (rideData.pricePerSeat < 50) {
          toast.error('Price per seat must be at least ₹50')
          return false
        }
        break
    }
    return true
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const publishRide = async () => {
    if (!validateStep(3)) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/rides/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(rideData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Ride published successfully!')
        // Redirect to ride details or dashboard
        window.location.href = `/ride/${data.rideId}`
      } else {
        throw new Error(data.message || 'Failed to publish ride')
      }
    } catch (error) {
      console.error('Publish error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to publish ride')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedVehicle = vehicles.find(v => v._id === rideData.vehicleId)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Car className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">Chla Chla</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/search" className="btn-secondary">
                Find a Ride
              </Link>
              <Link href="/dashboard" className="btn-primary">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step <= currentStep 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Route</span>
            <span>Schedule</span>
            <span>Details</span>
            <span>Review</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Step 1: Route */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Where are you going?</h2>
                <p className="text-gray-600">Enter your departure and arrival locations</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="From (e.g., Mumbai, Maharashtra)"
                    value={rideData.origin.address}
                    onChange={(e) => handleNestedInputChange('origin', 'address', e.target.value)}
                    className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                  />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="To (e.g., Delhi, Delhi)"
                    value={rideData.destination.address}
                    onChange={(e) => handleNestedInputChange('destination', 'address', e.target.value)}
                    className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                  />
                </div>
              </div>

              {/* Waypoints */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Waypoints (Optional)</h3>
                  <button
                    onClick={addWaypoint}
                    className="flex items-center gap-2 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Stop
                  </button>
                </div>

                {rideData.waypoints.map((waypoint, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Waypoint address"
                        value={waypoint.address}
                        onChange={(e) => updateWaypoint(index, 'address', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={() => removeWaypoint(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Schedule */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">When are you leaving?</h2>
                <p className="text-gray-600">Choose your departure date and time</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={rideData.departureDate}
                    onChange={(e) => handleInputChange('departureDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                  />
                </div>

                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="time"
                    value={rideData.departureTime}
                    onChange={(e) => handleInputChange('departureTime', e.target.value)}
                    className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Timing Tips:</p>
                    <ul className="space-y-1">
                      <li>• Choose a time that allows for traffic and unexpected delays</li>
                      <li>• Consider your passengers' schedules when setting departure time</li>
                      <li>• You can update the time up to 2 hours before departure</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Details */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Ride Details</h2>
                <p className="text-gray-600">Set your price, seats, and preferences</p>
              </div>

              {/* Vehicle Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Select Vehicle</h3>
                {vehicles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehicles.map((vehicle) => (
                      <div
                        key={vehicle._id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          rideData.vehicleId === vehicle._id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleInputChange('vehicleId', vehicle._id)}
                      >
                        <div className="flex items-center gap-3">
                          <Car className="w-8 h-8 text-gray-600" />
                          <div>
                            <div className="font-semibold text-gray-900">
                              {vehicle.color} {vehicle.make} {vehicle.model}
                            </div>
                            <div className="text-sm text-gray-600">
                              {vehicle.year} • {vehicle.seats} seats • {vehicle.licensePlate}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No vehicles found. Add a vehicle to publish rides.</p>
                    <Link href="/dashboard/vehicles" className="btn-primary">
                      Add Vehicle
                    </Link>
                  </div>
                )}
              </div>

              {/* Seats and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Seats
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleInputChange('availableSeats', Math.max(1, rideData.availableSeats - 1))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
                      <Users className="w-5 h-5 text-gray-400" />
                      <span className="text-lg font-semibold">{rideData.availableSeats}</span>
                    </div>
                    <button
                      onClick={() => handleInputChange('availableSeats', Math.min(selectedVehicle?.seats || 4, rideData.availableSeats + 1))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Seat (₹)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      min="50"
                      max="5000"
                      value={rideData.pricePerSeat}
                      onChange={(e) => handleInputChange('pricePerSeat', parseInt(e.target.value) || 0)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                      placeholder="500"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={rideData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Tell passengers about your ride, music preferences, stops, etc."
                />
              </div>

              {/* Preferences */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ride Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={rideData.preferences.smokingAllowed}
                      onChange={(e) => handleNestedInputChange('preferences', 'smokingAllowed', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-gray-700">Smoking allowed</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={rideData.preferences.petsAllowed}
                      onChange={(e) => handleNestedInputChange('preferences', 'petsAllowed', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-gray-700">Pets allowed</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={rideData.preferences.maxTwoInBack}
                      onChange={(e) => handleNestedInputChange('preferences', 'maxTwoInBack', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-gray-700">Max 2 in the back</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={rideData.preferences.instantBooking}
                      onChange={(e) => handleNestedInputChange('preferences', 'instantBooking', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-gray-700">Instant booking</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Ride</h2>
                <p className="text-gray-600">Make sure everything looks correct before publishing</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Route:</span>
                  <span className="text-gray-900">{rideData.origin.address} → {rideData.destination.address}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Date & Time:</span>
                  <span className="text-gray-900">
                    {new Date(`${rideData.departureDate}T${rideData.departureTime}`).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Vehicle:</span>
                  <span className="text-gray-900">
                    {selectedVehicle?.color} {selectedVehicle?.make} {selectedVehicle?.model}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Available Seats:</span>
                  <span className="text-gray-900">{rideData.availableSeats}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Price per Seat:</span>
                  <span className="text-gray-900 font-semibold">₹{rideData.pricePerSeat}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Total Earnings:</span>
                  <span className="text-primary-600 font-bold text-lg">
                    ₹{rideData.pricePerSeat * rideData.availableSeats}
                  </span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">Safety Features Included:</p>
                    <ul className="space-y-1">
                      <li>• Real-time GPS tracking for all passengers</li>
                      <li>• Emergency SOS button accessible during ride</li>
                      <li>• Verified passenger profiles and ratings</li>
                      <li>• 24/7 customer support</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="btn-primary flex items-center gap-2 px-6 py-3"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={publishRide}
                disabled={isLoading}
                className="btn-primary flex items-center gap-2 px-8 py-3 text-lg"
              >
                {isLoading ? (
                  <div className="spinner" />
                ) : (
                  <>
                    <Route className="w-5 h-5" />
                    Publish Ride
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
