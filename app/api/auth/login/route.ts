import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { email, password, phoneNumber } = body

    // Validate required fields
    if ((!email && !phoneNumber) || !password) {
      return NextResponse.json(
        { message: 'Email/phone and password are required' },
        { status: 400 }
      )
    }

    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: email || '' },
        { phoneNumber: phoneNumber || '' }
      ]
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

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

    // Update last login
    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date()
    })

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
