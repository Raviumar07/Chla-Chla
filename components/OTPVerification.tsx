'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, Shield, Clock, RefreshCw, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface OTPVerificationProps {
  phoneNumber?: string
  email?: string
  onVerificationSuccess: (token: string) => void
  onVerificationError: (error: string) => void
  purpose?: 'login' | 'signup' | 'emergency' | 'ride_verification'
  className?: string
}

export default function OTPVerification({
  phoneNumber,
  email,
  onVerificationSuccess,
  onVerificationError,
  purpose = 'login',
  className = ''
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [verificationMethod, setVerificationMethod] = useState<'phone' | 'email'>(
    phoneNumber ? 'phone' : 'email'
  )
  const [isVerified, setIsVerified] = useState(false)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  useEffect(() => {
    // Auto-send OTP when component mounts
    sendOTP()
  }, [])

  const sendOTP = async () => {
    setIsLoading(true)
    setCanResend(false)
    setCountdown(30)

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: verificationMethod === 'phone' ? phoneNumber : undefined,
          email: verificationMethod === 'email' ? email : undefined,
          purpose,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`OTP sent to your ${verificationMethod}`)
        // Focus first input
        inputRefs.current[0]?.focus()
      } else {
        throw new Error(data.message || 'Failed to send OTP')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP'
      toast.error(errorMessage)
      onVerificationError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOTP = async () => {
    const otpString = otp.join('')
    
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP')
      return
    }

    setIsVerifying(true)

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otp: otpString,
          phoneNumber: verificationMethod === 'phone' ? phoneNumber : undefined,
          email: verificationMethod === 'email' ? email : undefined,
          purpose,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsVerified(true)
        toast.success('Verification successful!')
        
        // Store verification token
        if (data.token) {
          localStorage.setItem('auth_token', data.token)
        }
        
        setTimeout(() => {
          onVerificationSuccess(data.token || '')
        }, 1000)
      } else {
        throw new Error(data.message || 'Invalid OTP')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed'
      toast.error(errorMessage)
      onVerificationError(errorMessage)
      
      // Clear OTP on error
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsVerifying(false)
    }
  }

  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Only take the last character

    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-verify when all digits are entered
    if (newOtp.every(digit => digit !== '') && !isVerifying) {
      setTimeout(() => verifyOTP(), 500)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('')
    
    const newOtp = [...otp]
    digits.forEach((digit, index) => {
      if (index < 6) newOtp[index] = digit
    })
    
    setOtp(newOtp)
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex(digit => digit === '')
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex
    inputRefs.current[focusIndex]?.focus()
  }

  const switchVerificationMethod = () => {
    if (phoneNumber && email) {
      setVerificationMethod(verificationMethod === 'phone' ? 'email' : 'phone')
      setOtp(['', '', '', '', '', ''])
      setCountdown(0)
      setCanResend(true)
    }
  }

  const formatContact = (contact: string) => {
    if (verificationMethod === 'phone') {
      return contact.replace(/(\d{2})(\d{5})(\d{5})/, '+$1 $2-$3')
    }
    return contact.replace(/(.{2})(.*)(@.*)/, '$1***$3')
  }

  if (isVerified) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`text-center ${className}`}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6 }}
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-8 h-8 text-green-600" />
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified!</h3>
        <p className="text-gray-600">Your {verificationMethod} has been successfully verified.</p>
      </motion.div>
    )
  }

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {verificationMethod === 'phone' ? (
            <Phone className="w-8 h-8 text-primary-600" />
          ) : (
            <Mail className="w-8 h-8 text-primary-600" />
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verify Your {verificationMethod === 'phone' ? 'Phone' : 'Email'}
        </h2>
        
        <p className="text-gray-600 mb-4">
          We've sent a 6-digit code to{' '}
          <span className="font-medium">
            {formatContact(verificationMethod === 'phone' ? phoneNumber || '' : email || '')}
          </span>
        </p>

        {purpose === 'emergency' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-red-800">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Emergency Verification</span>
            </div>
            <p className="text-xs text-red-600 mt-1">
              This verification is required for emergency features
            </p>
          </div>
        )}
      </div>

      {/* OTP Input */}
      <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <motion.input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg transition-all duration-200 ${
              digit
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400 focus:border-primary-500'
            } focus:outline-none focus:ring-2 focus:ring-primary-200`}
            whileFocus={{ scale: 1.05 }}
            disabled={isVerifying || isLoading}
          />
        ))}
      </div>

      {/* Verification Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={verifyOTP}
        disabled={otp.some(digit => !digit) || isVerifying || isLoading}
        className="w-full btn-primary mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isVerifying ? (
          <div className="flex items-center justify-center gap-2">
            <div className="spinner" />
            Verifying...
          </div>
        ) : (
          'Verify OTP'
        )}
      </motion.button>

      {/* Resend Section */}
      <div className="text-center space-y-3">
        {!canResend ? (
          <p className="text-gray-500 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Resend OTP in {countdown}s
          </p>
        ) : (
          <button
            onClick={sendOTP}
            disabled={isLoading}
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-2 mx-auto transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Resend OTP
          </button>
        )}

        {/* Switch verification method */}
        {phoneNumber && email && (
          <button
            onClick={switchVerificationMethod}
            className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
          >
            Use {verificationMethod === 'phone' ? 'email' : 'phone number'} instead
          </button>
        )}
      </div>

      {/* Security Note */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-600">
            <p className="font-medium mb-1">Security Note:</p>
            <p>
              This OTP is valid for 10 minutes and can only be used once. 
              Never share your OTP with anyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
