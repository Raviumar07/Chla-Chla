'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, AlertTriangle, MapPin, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface SOSButtonProps {
  userLocation?: { lat: number; lng: number }
  rideId?: string
  className?: string
}

export default function SOSButton({ userLocation, rideId, className = '' }: SOSButtonProps) {
  const [isActivated, setIsActivated] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const handleSOSActivation = async () => {
    if (isActivated) return

    // Start 5-second countdown before activation
    setCountdown(5)
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          activateSOS()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Show warning toast
    toast.error('SOS will activate in 5 seconds. Tap again to cancel.', {
      duration: 5000,
      id: 'sos-warning'
    })
  }

  const cancelSOS = () => {
    setCountdown(0)
    toast.dismiss('sos-warning')
    toast.success('SOS activation cancelled')
  }

  const activateSOS = async () => {
    setIsActivated(true)
    
    try {
      // Get current location if not provided
      let location = userLocation
      if (!location && navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          })
        })
        location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
      }

      // Prepare emergency data
      const emergencyData = {
        timestamp: new Date().toISOString(),
        location: location,
        rideId: rideId,
        userAgent: navigator.userAgent,
        emergencyType: 'SOS_ACTIVATED',
        batteryLevel: (navigator as any).getBattery ? await (navigator as any).getBattery().then((battery: any) => battery.level) : null
      }

      // Send to emergency services API
      const response = await fetch('/api/emergency/sos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(emergencyData)
      })

      if (response.ok) {
        toast.success('Emergency services have been notified. Help is on the way!', {
          duration: 10000,
          icon: '🚨'
        })

        // Try to call emergency number if supported
        if ('serviceWorker' in navigator) {
          // Send notification to emergency contacts
          await sendEmergencyNotifications(emergencyData)
        }

        // Share location continuously for 30 minutes
        startLocationSharing()
      } else {
        throw new Error('Failed to contact emergency services')
      }
    } catch (error) {
      console.error('SOS activation failed:', error)
      toast.error('Failed to activate SOS. Please call emergency services directly.')
      setIsActivated(false)
    }
  }

  const sendEmergencyNotifications = async (emergencyData: any) => {
    // Send SMS/notifications to emergency contacts
    try {
      await fetch('/api/emergency/notify-contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          ...emergencyData,
          message: `EMERGENCY: User has activated SOS. Location: ${emergencyData.location?.lat}, ${emergencyData.location?.lng}. Time: ${new Date().toLocaleString()}`
        })
      })
    } catch (error) {
      console.error('Failed to notify emergency contacts:', error)
    }
  }

  const startLocationSharing = () => {
    // Share location every 30 seconds for 30 minutes
    const locationInterval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const locationUpdate = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              timestamp: new Date().toISOString(),
              accuracy: position.coords.accuracy,
              speed: position.coords.speed
            }

            // Send location update
            fetch('/api/emergency/location-update', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
              },
              body: JSON.stringify(locationUpdate)
            }).catch(console.error)
          },
          (error) => console.error('Location update failed:', error),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
        )
      }
    }, 30000)

    // Stop after 30 minutes
    setTimeout(() => {
      clearInterval(locationInterval)
      setIsActivated(false)
      toast.success('Emergency location sharing has ended.')
    }, 30 * 60 * 1000)
  }

  return (
    <div className={`relative ${className}`}>
      {countdown > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
        >
          <div className="text-center">
            <div className="text-sm font-medium">SOS Activating in</div>
            <div className="text-2xl font-bold">{countdown}</div>
            <button
              onClick={cancelSOS}
              className="text-xs underline hover:no-underline mt-1"
            >
              Tap to cancel
            </button>
          </div>
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={countdown > 0 ? cancelSOS : handleSOSActivation}
        disabled={isActivated}
        className={`
          relative overflow-hidden rounded-full w-16 h-16 flex items-center justify-center font-bold text-white shadow-lg transition-all duration-300
          ${isActivated 
            ? 'bg-red-700 cursor-not-allowed' 
            : countdown > 0 
              ? 'bg-yellow-600 hover:bg-yellow-700' 
              : 'bg-red-600 hover:bg-red-700 sos-pulse'
          }
        `}
      >
        {isActivated ? (
          <div className="flex flex-col items-center">
            <AlertTriangle className="w-6 h-6 mb-1" />
            <div className="text-xs">ACTIVE</div>
          </div>
        ) : countdown > 0 ? (
          <div className="flex flex-col items-center">
            <Clock className="w-6 h-6 mb-1" />
            <div className="text-xs">{countdown}</div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Phone className="w-6 h-6 mb-1" />
            <div className="text-xs">SOS</div>
          </div>
        )}

        {!isActivated && countdown === 0 && (
          <motion.div
            className="absolute inset-0 bg-red-400 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.button>

      {isActivated && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs whitespace-nowrap"
        >
          <MapPin className="w-3 h-3 inline mr-1" />
          Emergency Active
        </motion.div>
      )}
    </div>
  )
}
