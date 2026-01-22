import { NextRequest, NextResponse } from 'next/server'
import { otpStorage } from '../send-otp/route'

// Development-only endpoint to get OTP for testing
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { message: 'Not available in production' },
      { status: 404 }
    )
  }

  const { searchParams } = new URL(request.url)
  const phoneNumber = searchParams.get('phone')
  const email = searchParams.get('email')
  
  const key = phoneNumber || email
  
  if (!key) {
    return NextResponse.json(
      { message: 'Phone number or email required' },
      { status: 400 }
    )
  }

  const storedData = otpStorage.get(key)
  
  if (!storedData) {
    return NextResponse.json(
      { message: 'No OTP found for this number/email' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    otp: storedData.otp,
    expires: storedData.expires,
    timeLeft: Math.max(0, Math.floor((storedData.expires - Date.now()) / 1000))
  })
}
