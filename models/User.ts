import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  _id: string
  email: string
  phoneNumber: string
  password: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: 'male' | 'female' | 'other'
  profilePicture?: string
  bio?: string
  isVerified: boolean
  emailVerified: boolean
  phoneVerified: boolean
  rating: number
  totalRides: number
  totalRidesAsDriver: number
  totalRidesAsPassenger: number
  accountType: 'driver' | 'passenger' | 'both'
  isPaidUser: boolean
  registrationFee: number
  transactionId?: string
  paymentMethod?: 'card' | 'upi' | 'netbanking'
  membershipType: 'basic' | 'premium'
  emergencyContacts: Array<{
    name: string
    phoneNumber: string
    relationship: string
  }>
  preferences: {
    smokingAllowed: boolean
    petsAllowed: boolean
    musicPreference: 'no_preference' | 'quiet' | 'moderate' | 'loud'
    chattiness: 'quiet' | 'moderate' | 'chatty'
  }
  documents: {
    drivingLicense?: {
      number: string
      expiryDate: Date
      verified: boolean
      imageUrl?: string
    }
    idProof?: {
      type: 'passport' | 'national_id' | 'voter_id'
      number: string
      verified: boolean
      imageUrl?: string
    }
  }
  bankDetails?: {
    accountNumber: string
    routingNumber: string
    accountHolderName: string
  }
  stripeCustomerId?: string
  createdAt: Date
  updatedAt: Date
  lastActive: Date
  isActive: boolean
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 1,
    max: 5
  },
  totalRides: {
    type: Number,
    default: 0
  },
  totalRidesAsDriver: {
    type: Number,
    default: 0
  },
  totalRidesAsPassenger: {
    type: Number,
    default: 0
  },
  accountType: {
    type: String,
    enum: ['driver', 'passenger', 'both'],
    default: 'passenger'
  },
  isPaidUser: {
    type: Boolean,
    default: false
  },
  registrationFee: {
    type: Number,
    default: 0
  },
  transactionId: {
    type: String,
    default: null
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking'],
    default: null
  },
  membershipType: {
    type: String,
    enum: ['basic', 'premium'],
    default: 'basic'
  },
  emergencyContacts: [{
    name: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      required: true
    }
  }],
  preferences: {
    smokingAllowed: {
      type: Boolean,
      default: false
    },
    petsAllowed: {
      type: Boolean,
      default: false
    },
    musicPreference: {
      type: String,
      enum: ['no_preference', 'quiet', 'moderate', 'loud'],
      default: 'no_preference'
    },
    chattiness: {
      type: String,
      enum: ['quiet', 'moderate', 'chatty'],
      default: 'moderate'
    }
  },
  documents: {
    drivingLicense: {
      number: String,
      expiryDate: Date,
      verified: {
        type: Boolean,
        default: false
      },
      imageUrl: String
    },
    idProof: {
      type: {
        type: String,
        enum: ['passport', 'national_id', 'voter_id']
      },
      number: String,
      verified: {
        type: Boolean,
        default: false
      },
      imageUrl: String
    }
  },
  bankDetails: {
    accountNumber: String,
    routingNumber: String,
    accountHolderName: String
  },
  stripeCustomerId: String,
  lastActive: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Indexes for better performance
UserSchema.index({ email: 1 })
UserSchema.index({ phoneNumber: 1 })
UserSchema.index({ rating: -1 })
UserSchema.index({ isActive: 1 })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
