import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { 
      firstName, 
      lastName, 
      email, 
      phoneNumber, 
      password, 
      accountType,
      registrationFee,
      isPaidUser,
      transactionId,
      paymentMethod,
      dateOfBirth, 
      gender 
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate paid registration
    if (isPaidUser && (!transactionId || !registrationFee || registrationFee !== 10)) {
      return NextResponse.json(
        { message: 'Invalid payment information' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }]
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email or phone number already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      accountType: accountType || 'passenger',
      isPaidUser: isPaidUser || false,
      registrationFee: registrationFee || 0,
      transactionId: transactionId || null,
      paymentMethod: paymentMethod || null,
      isVerified: isPaidUser || false, // Paid users get verified status
      emailVerified: false,
      phoneVerified: false,
      membershipType: isPaidUser ? 'premium' : 'basic'
    })

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
