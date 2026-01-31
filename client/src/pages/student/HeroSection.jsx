import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, PlayCircle, Users, Award, TrendingUp, ArrowRight } from 'lucide-react'

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()

  const searchHandler = (e) => {
    e.preventDefault();
    if(searchQuery.trim() !== "") {
      navigate(`/course/search?query=${searchQuery}`)
      setSearchQuery("")
    }
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 pt-24 pb-20 px-4">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium">
            <TrendingUp className="h-4 w-4" />
            <span>10,000+ Students Learning</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="block">Unlock Your</span>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              Potential With Learning
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
            Discover expert-led courses, hands-on projects, and a community of learners. 
            Transform your career today.
          </p>
        </div>

        {/* Main Search Bar - Keep only this one */}
        <div className="max-w-2xl mx-auto mb-16">
          <form onSubmit={searchHandler} className="relative group">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What do you want to learn today?"
              className="pl-14 pr-32 py-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 text-lg shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm group-hover:shadow-2xl transition-all"
            />
            <Button 
              type="submit" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-8 py-5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
            >
              Search
            </Button>
          </form>
        </div>

        {/* Stats - Enhanced glass effect */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-12">
          {[
            { icon: Users, value: "10K+", label: "Active Students" },
            { icon: Award, value: "500+", label: "Courses" },
            { icon: PlayCircle, value: "2K+", label: "Video Lessons" },
            { icon: Users, value: "50+", label: "Expert Instructors" },
          ].map((stat, index) => (
            <div 
              key={index}
              className="glass-effect p-6 rounded-2xl text-center hover-lift hover:shadow-xl border border-white/20 dark:border-gray-700/30"
            >
              <stat.icon className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button 
            onClick={() => navigate("/course/search")}
            className="px-8 py-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl text-lg"
          >
            Explore All Courses
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/login")}
            className="px-8 py-6 rounded-xl border-2 text-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            Watch Demo
          </Button>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute -bottom-10 left-10 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 blur-xl animate-bounce"></div>
      <div className="absolute -top-10 right-10 w-32 h-32 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full opacity-10 blur-xl animate-bounce delay-1000"></div>
    </div>
  )
}

export default HeroSection