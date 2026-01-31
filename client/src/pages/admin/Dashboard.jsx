import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

const Dashboard = () => {
  return (
    <div className=''>
      {/* Page Header */}
      <div className='pt-6'>
        <h1 className='text-3xl font-bold text-white '>Dashboard Overview</h1>
       
      </div>

      {/* Dashboard Cards - Added pt-6 for spacing */}
      <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 pt-6'>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-800 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-gray-300">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold text-blue-400'>400</p>
            <p className="text-sm text-gray-400 mt-2">This month</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-800 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-gray-300">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold text-blue-400'>₹3,40,000</p>
            <p className="text-sm text-gray-400 mt-2">This month</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-800 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-gray-300">Active Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold text-green-400'>9</p>
            <p className="text-sm text-gray-400 mt-2">Published courses</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-800 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-gray-300">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold text-purple-400'>1,200</p>
            <p className="text-sm text-gray-400 mt-2">Enrolled students</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard