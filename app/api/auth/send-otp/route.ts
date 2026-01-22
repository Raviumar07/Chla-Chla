import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

// In-memory OTP storage (use Redis in production)
const otpStorage = new Map<string, { otp: string; expires: number; attempts: number }>()

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { phoneNumber, email, purpose } = body

    if (!phoneNumber && !email) {
      return NextResponse.json(
        { message: 'Phone number or email is required' },
        { status: 400 }
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = Date.now() + 10 * 60 * 1000 // 10 minutes
    const key = phoneNumber || email

    // Store OTP
    otpStorage.set(key, { otp, expires, attempts: 0 })

    // Send OTP based on method
    let success = false
    let message = ''

    if (phoneNumber) {
      success = await sendSMSOTP(phoneNumber, otp, purpose)
      message = success ? 'OTP sent to your phone' : 'Failed to send SMS'
    } else if (email) {
      success = await sendEmailOTP(email, otp, purpose)
      message = success ? 'OTP sent to your email' : 'Failed to send email'
    }

    if (success) {
      return NextResponse.json({
        message,
        expires: expires
      })
    } else {
      return NextResponse.json(
        { message: 'Failed to send OTP' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// SMS OTP using Twilio or other SMS service
async function sendSMSOTP(phoneNumber: string, otp: string, purpose?: string) {
  try {
    // Option 1: Twilio (Recommended)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const twilio = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      )
      
      const message = `Your Chla Chla OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`
      
      await twilio.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+91${phoneNumber}`
      })
      
      return true
    }
    
    // Option 2: Fast2SMS (Indian SMS service)
    if (process.env.FAST2SMS_API_KEY) {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          flash: 0,
          numbers: phoneNumber
        })
      })
      
      const data = await response.json()
      return data.return === true
    }
    
    // Option 3: Mock SMS for development
    console.log(`📱 SMS OTP for ${phoneNumber}: ${otp}`)
    return true
    
  } catch (error) {
    console.error('SMS OTP error:', error)
    return false
  }
}

// Email OTP using Nodemailer
async function sendEmailOTP(email: string, otp: string, purpose?: string) {
  try {
    const nodemailer = require('nodemailer')
    
    // Create transporter
    const transporter = nodemailer.createTransporter({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // App password for Gmail
      }
    })
    
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: linear-gradient(135deg, #2563eb, #06b6d4); color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; }
          .otp { font-size: 32px; font-weight: bold; color: #2563eb; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 Chla Chla</h1>
            <p>Your OTP Verification Code</p>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>Your OTP for Chla Chla ${purpose || 'verification'} is:</p>
            <div class="otp">${otp}</div>
            <p><strong>This OTP is valid for 10 minutes only.</strong></p>
            <p>If you didn't request this OTP, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Chla Chla. Safe travels, always.</p>
          </div>
        </div>
      </body>
      </html>
    `
    
    await transporter.sendMail({
      from: `"Chla Chla" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your Chla Chla OTP: ${otp}`,
      html: htmlTemplate
    })
    
    return true
    
  } catch (error) {
    console.error('Email OTP error:', error)
    // Mock email for development
    console.log(`📧 Email OTP for ${email}: ${otp}`)
    return true
  }
}

// Cleanup expired OTPs (run periodically)
setInterval(() => {
  const now = Date.now()
  for (const [key, data] of otpStorage.entries()) {
    if (data.expires < now) {
      otpStorage.delete(key)
    }
  }
}, 5 * 60 * 1000) // Clean every 5 minutes

export { otpStorage }
