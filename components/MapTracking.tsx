'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { Icon, LatLng } from 'leaflet'
import { motion } from 'framer-motion'
import { Navigation, MapPin, Route, Clock, Users, AlertTriangle } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface Location {
  lat: number
  lng: number
  timestamp?: string
  accuracy?: number
}

interface MapTrackingProps {
  rideId: string
  driverLocation?: Location
  passengerLocations?: Location[]
  route?: Location[]
  destination?: Location
  pickup?: Location
  isDriver?: boolean
  onLocationUpdate?: (location: Location) => void
  emergencyMode?: boolean
}

// Custom hook for real-time location tracking
function useLocationTracking(onLocationUpdate?: (location: Location) => void) {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const watchIdRef = useRef<number | null>(null)

  const startTracking = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported')
      return
    }

    setIsTracking(true)
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date().toISOString(),
          accuracy: position.coords.accuracy
        }
        
        setCurrentLocation(location)
        onLocationUpdate?.(location)
      },
      (error) => {
        console.error('Location tracking error:', error)
        setIsTracking(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    )
  }

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsTracking(false)
  }

  useEffect(() => {
    return () => {
      stopTracking()
    }
  }, [])

  return { currentLocation, isTracking, startTracking, stopTracking }
}

// Component to handle map centering and updates
function MapController({ 
  center, 
  locations 
}: { 
  center?: Location
  locations: Location[] 
}) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], map.getZoom())
    } else if (locations.length > 0) {
      // Fit map to show all locations
      const bounds = locations.map(loc => [loc.lat, loc.lng] as [number, number])
      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [20, 20] })
      } else {
        map.setView(bounds[0], 15)
      }
    }
  }, [center, locations, map])

  return null
}

export default function MapTracking({
  rideId,
  driverLocation,
  passengerLocations = [],
  route = [],
  destination,
  pickup,
  isDriver = false,
  onLocationUpdate,
  emergencyMode = false
}: MapTrackingProps) {
  const { currentLocation, isTracking, startTracking, stopTracking } = useLocationTracking(onLocationUpdate)
  const [mapCenter, setMapCenter] = useState<Location | null>(null)
  const [estimatedArrival, setEstimatedArrival] = useState<string>('')

  // Custom icons for different markers
  const driverIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="white" stroke-width="3"/>
        <path d="M12 14L16 18L20 14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })

  const passengerIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="14" r="10" fill="#10B981" stroke="white" stroke-width="2"/>
        <circle cx="14" cy="14" r="4" fill="white"/>
      </svg>
    `),
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })

  const emergencyIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64=' + btoa(`
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="14" fill="#EF4444" stroke="white" stroke-width="3"/>
        <path d="M18 12V20M18 24H18.01" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `),
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })

  useEffect(() => {
    // Auto-start tracking for drivers or in emergency mode
    if (isDriver || emergencyMode) {
      startTracking()
    }

    return () => {
      stopTracking()
    }
  }, [isDriver, emergencyMode])

  useEffect(() => {
    // Set initial map center
    if (currentLocation) {
      setMapCenter(currentLocation)
    } else if (driverLocation) {
      setMapCenter(driverLocation)
    } else if (pickup) {
      setMapCenter(pickup)
    }
  }, [currentLocation, driverLocation, pickup])

  // Calculate estimated arrival time
  useEffect(() => {
    if (driverLocation && destination) {
      // Simple estimation based on distance (this would be more sophisticated in production)
      const distance = calculateDistance(driverLocation, destination)
      const estimatedMinutes = Math.round(distance * 2) // Rough estimate: 2 minutes per km
      setEstimatedArrival(`${estimatedMinutes} min`)
    }
  }, [driverLocation, destination])

  const calculateDistance = (loc1: Location, loc2: Location): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180
    const dLng = (loc2.lng - loc1.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const allLocations = [
    ...(driverLocation ? [driverLocation] : []),
    ...passengerLocations,
    ...(pickup ? [pickup] : []),
    ...(destination ? [destination] : []),
    ...(currentLocation ? [currentLocation] : [])
  ]

  return (
    <div className="relative w-full h-full">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isTracking ? stopTracking : startTracking}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg text-white font-medium ${
            isTracking ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          <Navigation className={`w-4 h-4 ${isTracking ? 'animate-pulse' : ''}`} />
          {isTracking ? 'Stop Tracking' : 'Start Tracking'}
        </motion.button>

        {emergencyMode && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg shadow-lg"
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Emergency Mode</span>
          </motion.div>
        )}
      </div>

      {/* Ride Info Panel */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <div className="space-y-2">
          {estimatedArrival && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>ETA: {estimatedArrival}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-gray-500" />
            <span>{passengerLocations.length + 1} passengers</span>
          </div>

          {currentLocation?.accuracy && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>±{Math.round(currentLocation.accuracy)}m accuracy</span>
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <MapContainer
        center={mapCenter ? [mapCenter.lat, mapCenter.lng] : [28.6139, 77.2090]} // Default to Delhi
        zoom={13}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={mapCenter || undefined} locations={allLocations} />

        {/* Driver Location */}
        {driverLocation && (
          <Marker 
            position={[driverLocation.lat, driverLocation.lng]} 
            icon={emergencyMode ? emergencyIcon : driverIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>{emergencyMode ? 'Emergency Location' : 'Driver'}</strong>
                <br />
                {driverLocation.timestamp && (
                  <small>{new Date(driverLocation.timestamp).toLocaleTimeString()}</small>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Passenger Locations */}
        {passengerLocations.map((location, index) => (
          <Marker 
            key={index}
            position={[location.lat, location.lng]} 
            icon={passengerIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>Passenger {index + 1}</strong>
                <br />
                {location.timestamp && (
                  <small>{new Date(location.timestamp).toLocaleTimeString()}</small>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Pickup Location */}
        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]}>
            <Popup>
              <div className="text-center">
                <strong>Pickup Point</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination */}
        {destination && (
          <Marker position={[destination.lat, destination.lng]}>
            <Popup>
              <div className="text-center">
                <strong>Destination</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline */}
        {route.length > 1 && (
          <Polyline
            positions={route.map(loc => [loc.lat, loc.lng])}
            color={emergencyMode ? "#EF4444" : "#3B82F6"}
            weight={4}
            opacity={0.8}
          />
        )}

        {/* Current Location (if different from driver location) */}
        {currentLocation && (!driverLocation || !isDriver) && (
          <Marker position={[currentLocation.lat, currentLocation.lng]}>
            <Popup>
              <div className="text-center">
                <strong>Your Location</strong>
                <br />
                <small>Accuracy: ±{currentLocation.accuracy}m</small>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
