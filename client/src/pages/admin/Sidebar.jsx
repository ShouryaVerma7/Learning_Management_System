import { ChartNoAxesColumn, SquareLibrary } from 'lucide-react'
import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

const Sidebar = () => {
  const location = useLocation();
  
  return (
    <div className='flex min-h-screen'>
      {/* Sidebar */}
      <div className='hidden lg:block w-[250px] sm:w-[300px] space-y-8 border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 sticky top-0 h-screen'>
        {/* Logo Section - FIXED POSITION */}
        <div className="pt-6">
          <div className="flex items-center gap-3 mb-8">
           
           
          </div>
        </div>

        <div className="space-y-2">
          <Link 
            to="/admin/dashboard" 
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              location.pathname === '/admin/dashboard' 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-l-4 border-transparent'
            }`}
          >
            <ChartNoAxesColumn size={20}/>
            <h1 className="font-medium">Dashboard</h1>
          </Link>
          
          <Link 
            to="/admin/courses" 
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              location.pathname.startsWith('/admin/courses') 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-l-4 border-transparent'
            }`}
          >
            <SquareLibrary size={20}/>
            <h1 className="font-medium">Courses</h1>
          </Link>
        </div>
      </div>
      
      {/* Main Content - FIXED: Added pt-20 for navbar spacing */}
      <div className="flex-1 p-4 md:p-8 lg:p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
        <div className="pt-20"> {/* Added this wrapper */}
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Sidebar