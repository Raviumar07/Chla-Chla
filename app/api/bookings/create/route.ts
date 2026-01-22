import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Booking from '@/models/Booking'
import Ride from '@/models/Ride'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    // Get token from headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    let decoded: any
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      rideId,
      seatsRequested,
      pickupLocation,
      dropoffLocation,
      notes = ''
    } = body

    // Validate required fields
    if (!rideId || !seatsRequested) {
      return NextResponse.json(
        { message: 'Ride ID and seats requested are required' },
        { status: 400 }
      )
    }

    // Find the ride
    const ride = await Ride.findById(rideId).populate('driver', 'firstName lastName')
    if (!ride) {
      return NextResponse.json(
        { message: 'Ride not found' },
        { status: 404 }
      )
    }

    // Check if ride is still active and in future
    if (ride.status !== 'active') {
      return NextResponse.json(
        { message: 'Ride is no longer available' },
        { status: 400 }
      )
    }

    if (new Date(ride.departureTime) <= new Date()) {
      return NextResponse.json(
        { message: 'Cannot book past rides' },
        { status: 400 }
      )
    }

    // Check if user is trying to book their own ride
    if (ride.driver._id.toString() === decoded.userId) {
      return NextResponse.json(
        { message: 'Cannot book your own ride' },
        { status: 400 }
      )
    }

    // Check available seats
    if (ride.availableSeats < seatsRequested) {
      return NextResponse.json(
        { message: `Only ${ride.availableSeats} seats available` },
        { status: 400 }
      )
    }

    // Check if user already has a booking for this ride
    const existingBooking = await Booking.findOne({
      ride: rideId,
      passenger: decoded.userId,
      status: { $in: ['pending', 'confirmed'] }
    })

    if (existingBooking) {
      return NextResponse.json(
        { message: 'You already have a booking for this ride' },
        { status: 400 }
      )
    }

    // Calculate total amount
    const totalAmount = ride.pricePerSeat * seatsRequested

    // Create booking
    const booking = await Booking.create({
      ride: rideId,
      passenger: decoded.userId,
      seatsBooked: seatsRequested,
      totalAmount,
      status: ride.preferences.instantBooking ? 'confirmed' : 'pending',
      pickupLocation: pickupLocation || ride.origin,
      dropoffLocation: dropoffLocation || ride.destination,
      notes,
      bookingDate: new Date(),
      paymentStatus: 'pending'
    })

    // Update ride available seats if instant booking
    if (ride.preferences.instantBooking) {
      await Ride.findByIdAndUpdate(rideId, {
        $inc: { availableSeats: -seatsRequested },
        $push: { bookings: booking._id }
      })
    }

    // Populate booking with passenger and ride info
    const populatedBooking = await Booking.findById(booking._id)
      .populate('passenger', 'firstName lastName profilePicture phoneNumber')
      .populate({
        path: 'ride',
        populate: {
          path: 'driver',
          select: 'firstName lastName profilePicture phoneNumber'
        }
      })

    return NextResponse.json({
      message: ride.preferences.instantBooking ? 
        'Booking confirmed successfully' : 
        'Booking request sent to driver',
      booking: populatedBooking,
      requiresPayment: true
    }, { status: 201 })

  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
