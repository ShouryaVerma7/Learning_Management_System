import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { Star, Clock, Users, Eye } from 'lucide-react'
import { useState, useMemo } from 'react'

const Course = ({ course }) => {
  const [isHovered, setIsHovered] = useState(false)

  // Use actual data from course or sensible defaults
  const rating = course.averageRating?.toFixed(1) || '4.5'
  const studentCount = course.enrolledStudents?.length || 0
  const duration = course.totalDuration || '10h 0m' // Make sure this field exists in your course model

  // Format the duration nicely
  const formattedDuration = useMemo(() => {
    if (typeof duration === 'string') return duration
    
    // If duration is in minutes
    if (typeof duration === 'number') {
      const hours = Math.floor(duration / 60)
      const minutes = duration % 60
      return `${hours}h ${minutes}m`
    }
    
    return '10h 0m' // Default fallback
  }, [duration])

  return (
    <Link to={`/course-detail/${course._id}`}>
      <Card 
        className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-lg hover:shadow-2xl transition-all duration-500 hover-lift"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
        
        {/* Image container */}
        <div className="relative overflow-hidden h-48">
          <img 
            className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`} 
            src={course.courseThumbnail || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop"} 
            alt={course.courseTitle} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          
          {/* Course level badge */}
          <Badge className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gray-900/90 text-white border-0 shadow-md">
            {course.courseLevel}
          </Badge>
          
          {/* Price tag */}
          <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            ₹{course.coursePrice}
          </div>
        </div>

        <CardContent className="p-5 relative">
          {/* Instructor */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border-2 border-white shadow-md">
                <AvatarImage src={course.creator?.photoUrl} alt={course.creator?.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                  {course.creator?.name?.charAt(0) || 'I'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-300">
                {course.creator?.name || 'Instructor'}
              </span>
            </div>
            
            {/* Rating - FIXED */}
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold">{rating}</span>
            </div>
          </div>

          {/* Course title */}
          <h3 className="font-bold text-lg mb-3 line-clamp-2 h-14 group-hover:text-blue-400 transition-colors">
            {course.courseTitle}
          </h3>

          {/* Course stats - ALL FIXED */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formattedDuration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{studentCount.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>Enroll Now</span>
            </div>
          </div>

          {/* Progress indicator for enrolled courses */}
          {course.progress !== undefined && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{course.progress}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Hover indicator */}
          <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform transition-transform duration-300 ${isHovered ? 'scale-x-100' : 'scale-x-0'}`}></div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default Course