import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { otpStorage } from '../send-otp/route'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { phoneNumber, email, otp, purpose } = body

    if (!otp || otp.length !== 6) {
      return NextResponse.json(
        { message: 'Invalid OTP format' },
        { status: 400 }
      )
    }

    const key = phoneNumber || email
    if (!key) {
      return NextResponse.json(
        { message: 'Phone number or email is required' },
        { status: 400 }
      )
    }

    // Get stored OTP
    const storedData = otpStorage.get(key)
    
    if (!storedData) {
      return NextResponse.json(
        { message: 'OTP not found or expired' },
        { status: 400 }
      )
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expires) {
      otpStorage.delete(key)
      return NextResponse.json(
        { message: 'OTP has expired' },
        { status: 400 }
      )
    }

    // Check attempts limit
    if (storedData.attempts >= 3) {
      otpStorage.delete(key)
      return NextResponse.json(
        { message: 'Too many failed attempts. Please request a new OTP' },
        { status: 400 }
      )
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts += 1
      return NextResponse.json(
        { message: 'Invalid OTP' },
        { status: 400 }
      )
    }

    // OTP is valid - remove from storage
    otpStorage.delete(key)

    // Update user verification status
    let user = null
    if (phoneNumber) {
      user = await User.findOneAndUpdate(
        { phoneNumber },
        { phoneVerified: true },
        { new: true }
      )
    } else if (email) {
      user = await User.findOneAndUpdate(
        { email },
        { emailVerified: true },
        { new: true }
      )
    }

    // Generate verification token
    const verificationToken = jwt.sign(
      { 
        verified: true,
        phoneNumber: phoneNumber || null,
        email: email || null,
        purpose,
        timestamp: Date.now()
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    )

    return NextResponse.json({
      message: 'OTP verified successfully',
      verified: true,
      token: verificationToken,
      user: user ? {
        id: user._id,
        phoneVerified: user.phoneVerified,
        emailVerified: user.emailVerified,
        isVerified: user.phoneVerified && user.emailVerified
      } : null
    })

  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
