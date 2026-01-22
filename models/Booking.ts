import mongoose, { Document, Schema } from 'mongoose'

export interface IBooking extends Document {
  _id: string
  ride: string // Ride ID
  passenger: string // User ID
  seatsBooked: number
  totalAmount: number
  currency: string
  pickupLocation?: {
    address: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  dropoffLocation?: {
    address: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed'
  paymentIntentId?: string
  bookingTime: Date
  confirmationTime?: Date
  cancellationTime?: Date
  cancellationReason?: string
  passengerNotes?: string
  driverNotes?: string
  emergencyContacted: boolean
  createdAt: Date
  updatedAt: Date
}

const BookingSchema = new Schema<IBooking>({
  ride: {
    type: Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  passenger: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seatsBooked: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  pickupLocation: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  dropoffLocation: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentIntentId: String,
  bookingTime: {
    type: Date,
    default: Date.now
  },
  confirmationTime: Date,
  cancellationTime: Date,
  cancellationReason: String,
  passengerNotes: {
    type: String,
    maxlength: 300
  },
  driverNotes: {
    type: String,
    maxlength: 300
  },
  emergencyContacted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Indexes
BookingSchema.index({ ride: 1 })
BookingSchema.index({ passenger: 1 })
BookingSchema.index({ status: 1 })
BookingSchema.index({ paymentStatus: 1 })
BookingSchema.index({ bookingTime: -1 })

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema)
