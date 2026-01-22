import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IVehicle extends Document {
  _id: string
  owner: Types.ObjectId // User ID
  make: string
  vehicleModel: string
  year: number
  color: string
  licensePlate: string
  vehicleType: 'sedan' | 'hatchback' | 'suv' | 'minivan' | 'coupe' | 'convertible' | 'other'
  seats: number
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid'
  features: string[]
  images: string[]
  documents: {
    registration: {
      number: string
      expiryDate: Date
      verified: boolean
      imageUrl?: string
    }
    insurance: {
      policyNumber: string
      expiryDate: Date
      verified: boolean
      imageUrl?: string
    }
    pollution: {
      certificateNumber: string
      expiryDate: Date
      verified: boolean
      imageUrl?: string
    }
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const VehicleSchema = new Schema<IVehicle>({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  make: {
    type: String,
    required: true,
    trim: true
  },
  vehicleModel: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1990,
    max: new Date().getFullYear() + 1
  },
  color: {
    type: String,
    required: true,
    trim: true
  },
  licensePlate: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['sedan', 'hatchback', 'suv', 'minivan', 'coupe', 'convertible', 'other'],
    required: true
  },
  seats: {
    type: Number,
    required: true,
    min: 2,
    max: 8
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', 'hybrid'],
    required: true
  },
  features: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String
  }],
  documents: {
    registration: {
      number: {
        type: String,
        required: true
      },
      expiryDate: {
        type: Date,
        required: true
      },
      verified: {
        type: Boolean,
        default: false
      },
      imageUrl: String
    },
    insurance: {
      policyNumber: {
        type: String,
        required: true
      },
      expiryDate: {
        type: Date,
        required: true
      },
      verified: {
        type: Boolean,
        default: false
      },
      imageUrl: String
    },
    pollution: {
      certificateNumber: String,
      expiryDate: Date,
      verified: {
        type: Boolean,
        default: false
      },
      imageUrl: String
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Indexes
VehicleSchema.index({ owner: 1 })
VehicleSchema.index({ licensePlate: 1 })
VehicleSchema.index({ isActive: 1 })

export default mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema)
