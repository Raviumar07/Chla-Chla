import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Ride from '@/models/Ride'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')
    const date = searchParams.get('date')
    const passengers = parseInt(searchParams.get('passengers') || '1')
    const maxPrice = parseInt(searchParams.get('maxPrice') || '5000')
    const sortBy = searchParams.get('sortBy') || 'price'

    if (!origin || !destination) {
      return NextResponse.json(
        { message: 'Origin and destination are required' },
        { status: 400 }
      )
    }

    // Build search query
    const query: any = {
      status: 'active',
      availableSeats: { $gte: passengers },
      pricePerSeat: { $lte: maxPrice },
      'origin.city': { $regex: origin, $options: 'i' },
      'destination.city': { $regex: destination, $options: 'i' }
    }

    // Add date filter if provided
    if (date) {
      const searchDate = new Date(date)
      const nextDay = new Date(searchDate)
      nextDay.setDate(nextDay.getDate() + 1)
      
      query.departureTime = {
        $gte: searchDate,
        $lt: nextDay
      }
    } else {
      // Only show future rides
      query.departureTime = { $gte: new Date() }
    }

    // Build sort criteria
    let sortCriteria: any = {}
    switch (sortBy) {
      case 'time':
        sortCriteria = { departureTime: 1 }
        break
      case 'rating':
        sortCriteria = { 'driver.rating': -1 }
        break
      case 'price':
      default:
        sortCriteria = { pricePerSeat: 1 }
        break
    }

    // Execute search with population
    const rides = await Ride.find(query)
      .populate('driver', 'firstName lastName profilePicture rating totalRides isVerified')
      .populate('vehicle', 'make model color vehicleType')
      .sort(sortCriteria)
      .limit(50)
      .lean()

    return NextResponse.json({
      rides,
      count: rides.length,
      searchCriteria: {
        origin,
        destination,
        date,
        passengers,
        maxPrice,
        sortBy
      }
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
