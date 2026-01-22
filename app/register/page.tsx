'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  CreditCard, 
  Shield, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Car,
  Users,
  Star,
  IndianRupee
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import OTPVerification from '@/components/OTPVerification'

interface RegistrationData {
  // Personal Info
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  password: string
  confirmPassword: string
  
  // Account Type
  accountType: 'driver' | 'passenger' | 'both'
  
  // Payment Info
  paymentMethod: 'card' | 'upi' | 'netbanking'
  paymentCompleted: boolean
  transactionId?: string
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    accountType: 'passenger',
    paymentMethod: 'upi',
    paymentCompleted: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [showOTPVerification, setShowOTPVerification] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [verificationToken, setVerificationToken] = useState('')

  const REGISTRATION_FEE = 10 // ₹10

  const handleInputChange = (field: keyof RegistrationData, value: any) => {
    setRegistrationData(prev => ({ ...prev, [field]: value }))
  }

  const validateStep1 = () => {
    const { firstName, lastName, email, phoneNumber, password, confirmPassword } = registrationData
    
    if (!firstName || !lastName || !email || !phoneNumber || !password || !confirmPassword) {
      toast.error('Please fill all required fields')
      return false
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return false
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return false
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email')
      return false
    }
    
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(phoneNumber)) {
      toast.error('Please enter a valid 10-digit phone number')
      return false
    }
    
    return true
  }

  const processPayment = async () => {
    setPaymentLoading(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In real implementation, integrate with Razorpay/Stripe
      const mockTransactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      handleInputChange('paymentCompleted', true)
      handleInputChange('transactionId', mockTransactionId)
      
      toast.success('Payment successful! Proceeding with registration...')
      
      // Auto proceed to final step
      setTimeout(() => {
        setCurrentStep(3)
      }, 1000)
      
    } catch (error) {
      toast.error('Payment failed. Please try again.')
    } finally {
      setPaymentLoading(false)
    }
  }

  const completeRegistration = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...registrationData,
          registrationFee: REGISTRATION_FEE,
          isPaidUser: true
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success('Registration successful! Welcome to Chla Chla!')
        
        // Redirect to dashboard or login
        setTimeout(() => {
          window.location.href = '/auth?mode=login'
        }, 2000)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Registration failed')
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPSuccess = (token: string) => {
    setVerificationToken(token)
    setOtpVerified(true)
    setShowOTPVerification(false)
    toast.success('Phone number verified successfully!')
  }

  const handleOTPError = (error: string) => {
    toast.error(error)
  }

  const nextStep = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return
      // Show OTP verification after step 1
      setShowOTPVerification(true)
      return
    }
    if (currentStep === 2 && !registrationData.paymentCompleted) {
      toast.error('Please complete payment to proceed')
      return
    }
    setCurrentStep(prev => prev + 1)
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="text-3xl font-bold text-blue-600">Chla Chla</div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Chla Chla</h1>
          <p className="text-gray-600">Premium carpooling experience starts here</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-1 mx-2 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={registrationData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={registrationData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={registrationData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={registrationData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={registrationData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={registrationData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Account Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    I want to join as: *
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'passenger', label: 'Passenger', icon: Users, desc: 'Book rides with others' },
                      { id: 'driver', label: 'Driver', icon: Car, desc: 'Offer rides and earn money' },
                      { id: 'both', label: 'Both', icon: Star, desc: 'Drive and travel (Recommended)' }
                    ].map(({ id, label, icon: Icon, desc }) => (
                      <label key={id} className="cursor-pointer">
                        <input
                          type="radio"
                          name="accountType"
                          value={id}
                          checked={registrationData.accountType === id}
                          onChange={(e) => handleInputChange('accountType', e.target.value)}
                          className="sr-only"
                        />
                        <div className={`p-4 border-2 rounded-lg transition-all ${
                          registrationData.accountType === id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="font-medium text-gray-900">{label}</div>
                              <div className="text-sm text-gray-600">{desc}</div>
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Registration Fee</h2>
              
              {/* Fee Information */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IndianRupee className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Premium Membership</h3>
                      <p className="text-sm text-gray-600">One-time registration fee</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">₹{REGISTRATION_FEE}</div>
                    <div className="text-sm text-gray-500">Only</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Verified account with premium badge</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Priority customer support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Enhanced safety features</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Access to premium rides</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Payment Method
                </label>
                <div className="space-y-3">
                  {[
                    { id: 'upi', label: 'UPI Payment', desc: 'Pay using UPI apps like GPay, PhonePe' },
                    { id: 'card', label: 'Credit/Debit Card', desc: 'Secure card payment' },
                    { id: 'netbanking', label: 'Net Banking', desc: 'Direct bank transfer' }
                  ].map(({ id, label, desc }) => (
                    <label key={id} className="cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={id}
                        checked={registrationData.paymentMethod === id}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`p-4 border-2 rounded-lg transition-all ${
                        registrationData.paymentMethod === id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900">{label}</div>
                            <div className="text-sm text-gray-600">{desc}</div>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Button */}
              {!registrationData.paymentCompleted ? (
                <button
                  onClick={processPayment}
                  disabled={paymentLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {paymentLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Pay ₹{REGISTRATION_FEE} Securely
                    </>
                  )}
                </button>
              ) : (
                <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="font-semibold text-green-700">Payment Successful!</div>
                  <div className="text-sm text-green-600">Transaction ID: {registrationData.transactionId}</div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Completion */}
          {currentStep === 3 && (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Almost Done!</h2>
                <p className="text-gray-600">Complete your registration to start using Chla Chla</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>Name:</strong> {registrationData.firstName} {registrationData.lastName}</div>
                  <div><strong>Email:</strong> {registrationData.email}</div>
                  <div><strong>Phone:</strong> {registrationData.phoneNumber}</div>
                  <div><strong>Account Type:</strong> {registrationData.accountType}</div>
                  <div><strong>Payment:</strong> ₹{REGISTRATION_FEE} - Completed ✅</div>
                </div>
              </div>

              <button
                onClick={completeRegistration}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Complete Registration
                  </>
                )}
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {currentStep < 3 && (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth?mode=login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOTPVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <OTPVerification
              phoneNumber={registrationData.phoneNumber}
              purpose="signup"
              onVerificationSuccess={(token) => {
                handleOTPSuccess(token)
                setCurrentStep(2) // Move to payment step
              }}
              onVerificationError={handleOTPError}
              className="p-6"
            />
            <div className="p-6 pt-0">
              <button
                onClick={() => setShowOTPVerification(false)}
                className="w-full text-gray-600 hover:text-gray-800 text-sm"
              >
                Cancel Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
