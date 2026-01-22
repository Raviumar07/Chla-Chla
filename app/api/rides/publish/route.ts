import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Ride from '@/models/Ride'
import User from '@/models/User'
import Vehicle from '@/models/Vehicle'

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
      origin,
      destination,
      waypoints = [],
      departureDate,
      departureTime,
      availableSeats,
      pricePerSeat,
      vehicleId,
      description = '',
      preferences = {}
    } = body

    // Validate required fields
    if (!origin?.address || !destination?.address || !departureDate || 
        !departureTime || !availableSeats || !pricePerSeat || !vehicleId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify user exists
    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Verify vehicle belongs to user
    const vehicle = await Vehicle.findOne({ _id: vehicleId, owner: decoded.userId })
    if (!vehicle) {
      return NextResponse.json(
        { message: 'Vehicle not found or not owned by user' },
        { status: 404 }
      )
    }

    // Create departure datetime
    const departureDateTime = new Date(`${departureDate}T${departureTime}`)
    
    // Validate departure time is in future
    if (departureDateTime <= new Date()) {
      return NextResponse.json(
        { message: 'Departure time must be in the future' },
        { status: 400 }
      )
    }

    // Calculate estimated arrival time (placeholder - would use maps API in production)
    const estimatedDuration = 120 // 2 hours placeholder
    const estimatedArrivalTime = new Date(departureDateTime.getTime() + estimatedDuration * 60000)

    // Create ride
    const ride = await Ride.create({
      driver: decoded.userId,
      vehicle: vehicleId,
      origin: {
        address: origin.address,
        city: origin.city || '',
        state: origin.state || '',
        coordinates: origin.coordinates || { lat: 0, lng: 0 }
      },
      destination: {
        address: destination.address,
        city: destination.city || '',
        state: destination.state || '',
        coordinates: destination.coordinates || { lat: 0, lng: 0 }
      },
      waypoints: waypoints.map((wp: any) => ({
        address: wp.address,
        city: wp.city || '',
        coordinates: wp.coordinates || { lat: 0, lng: 0 }
      })),
      departureTime: departureDateTime,
      estimatedArrivalTime,
      availableSeats,
      totalSeats: availableSeats,
      pricePerSeat,
      description,
      preferences: {
        smokingAllowed: preferences.smokingAllowed || false,
        petsAllowed: preferences.petsAllowed || false,
        maxTwoInBack: preferences.maxTwoInBack || false,
        instantBooking: preferences.instantBooking || true
      },
      status: 'active',
      bookings: [],
      route: {
        distance: 0, // Would calculate with maps API
        estimatedDuration
      }
    })

    // Populate the response with driver and vehicle info
    const populatedRide = await Ride.findById(ride._id)
      .populate('driver', 'firstName lastName profilePicture rating totalRides isVerified')
      .populate('vehicle', 'make model color vehicleType year')

    return NextResponse.json({
      message: 'Ride published successfully',
      rideId: ride._id,
      ride: populatedRide
    }, { status: 201 })

  } catch (error) {
    console.error('Publish ride error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
