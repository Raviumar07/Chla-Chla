import mongoose, { Document, Schema } from 'mongoose'

export interface IRide extends Document {
  _id: string
  driver: string // User ID
  vehicle: string // Vehicle ID
  origin: {
    address: string
    city: string
    state: string
    country: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  destination: {
    address: string
    city: string
    state: string
    country: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  waypoints: Array<{
    address: string
    city: string
    coordinates: {
      lat: number
      lng: number
    }
    pickupTime: Date
  }>
  departureTime: Date
  estimatedArrivalTime: Date
  actualDepartureTime?: Date
  actualArrivalTime?: Date
  availableSeats: number
  totalSeats: number
  pricePerSeat: number
  currency: string
  description?: string
  preferences: {
    smokingAllowed: boolean
    petsAllowed: boolean
    maxTwoInBack: boolean
    instantBooking: boolean
  }
  route: Array<{
    lat: number
    lng: number
  }>
  distance: number // in kilometers
  estimatedDuration: number // in minutes
  status: 'active' | 'completed' | 'cancelled' | 'in_progress'
  bookings: string[] // Booking IDs
  reviews: string[] // Review IDs
  emergencyMode: boolean
  realTimeTracking: boolean
  createdAt: Date
  updatedAt: Date
}

const RideSchema = new Schema<IRide>({
  driver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  origin: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'India'
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    }
  },
  destination: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'India'
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    }
  },
  waypoints: [{
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    },
    pickupTime: {
      type: Date,
      required: true
    }
  }],
  departureTime: {
    type: Date,
    required: true
  },
  estimatedArrivalTime: {
    type: Date,
    required: true
  },
  actualDepartureTime: Date,
  actualArrivalTime: Date,
  availableSeats: {
    type: Number,
    required: true,
    min: 0
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 1,
    max: 7
  },
  pricePerSeat: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  description: {
    type: String,
    maxlength: 500
  },
  preferences: {
    smokingAllowed: {
      type: Boolean,
      default: false
    },
    petsAllowed: {
      type: Boolean,
      default: false
    },
    maxTwoInBack: {
      type: Boolean,
      default: false
    },
    instantBooking: {
      type: Boolean,
      default: true
    }
  },
  route: [{
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  }],
  distance: {
    type: Number,
    required: true
  },
  estimatedDuration: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'in_progress'],
    default: 'active'
  },
  bookings: [{
    type: Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }],
  emergencyMode: {
    type: Boolean,
    default: false
  },
  realTimeTracking: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Indexes for better performance
RideSchema.index({ driver: 1 })
RideSchema.index({ 'origin.city': 1, 'destination.city': 1 })
RideSchema.index({ departureTime: 1 })
RideSchema.index({ status: 1 })
RideSchema.index({ availableSeats: 1 })
RideSchema.index({ pricePerSeat: 1 })
RideSchema.index({ createdAt: -1 })

// Geospatial indexes for location-based queries
RideSchema.index({ 'origin.coordinates': '2dsphere' })
RideSchema.index({ 'destination.coordinates': '2dsphere' })

export default mongoose.models.Ride || mongoose.model<IRide>('Ride', RideSchema)
