import React, { useState, useMemo, useEffect } from "react";
import { AlertCircle, Filter, Search as SearchIcon } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import FilterComponent from "./Filter";
import Searchresult from "./Searchresult";
import { useGetSearchCourseQuery } from "@/features/api/courseApi";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawQuery = searchParams.get("query") || "";
  const [localQuery, setLocalQuery] = useState(rawQuery);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortByPrice, setSortByPrice] = useState("");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Update local query when URL changes
  useEffect(() => {
    setLocalQuery(rawQuery);
  }, [rawQuery]);

  // Build search arguments
  const searchArg = useMemo(() => ({
    query: rawQuery,
    categories: selectedCategories,
    sortBy: sortByPrice,
    minPrice: priceRange[0],
    maxPrice: priceRange[1]
  }), [rawQuery, selectedCategories, sortByPrice, priceRange]);

  const { data, isLoading, isFetching, error } = useGetSearchCourseQuery(searchArg, {
    skip: !rawQuery && selectedCategories.length === 0,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchParams({ query: localQuery.trim() });
    }
  };

  const handleFilterChange = (categories, price, sortBy) => {
    setSelectedCategories(categories);
    setPriceRange(price);
    setSortByPrice(sortBy);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 10000]);
    setSortByPrice("");
  };

  const isEmpty = !isLoading && !isFetching && data?.courses?.length === 0;
  const hasResults = !isLoading && !isFetching && data?.courses?.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {rawQuery ? `Results for "${rawQuery}"` : "Browse All Courses"}
          </h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mb-6">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Search courses, topics, or instructors..."
                className="pl-12 pr-4 py-3 rounded-xl border-2 border-gray-700 focus:border-blue-500 bg-gray-900"
              />
              <Button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                Search
              </Button>
            </div>
          </form>

          {rawQuery && (
            <p className="text-gray-400">
              Showing results for <span className="font-semibold text-blue-400">{rawQuery}</span>
            </p>
          )}
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-6">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {(selectedCategories.length > 0 || sortByPrice || priceRange[1] < 10000) && (
                  <Badge className="ml-2 bg-blue-600 text-white">
                    {selectedCategories.length + (sortByPrice ? 1 : 0) + (priceRange[1] < 10000 ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0 custom-scrollbar">
              <div className="p-6 h-full overflow-y-auto">
                <FilterComponent handleFilterChange={handleFilterChange} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block w-[280px] shrink-0">
            <div className="sticky top-24">
              <FilterComponent handleFilterChange={handleFilterChange} />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Active Filters */}
            {(selectedCategories.length > 0 || sortByPrice || priceRange[1] < 10000) && (
              <div className="mb-6 p-4 rounded-lg bg-blue-900/20 border border-blue-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-blue-300">Active Filters</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((category) => (
                    <Badge 
                      key={category} 
                      variant="secondary"
                      className="bg-blue-900 text-blue-200 hover:bg-blue-800 cursor-pointer"
                      onClick={() => handleFilterChange(
                        selectedCategories.filter(c => c !== category),
                        priceRange,
                        sortByPrice
                      )}
                    >
                      {category} ✕
                    </Badge>
                  ))}
                  {sortByPrice && (
                    <Badge 
                      variant="secondary"
                      className="bg-blue-900 text-blue-200 hover:bg-blue-800 cursor-pointer"
                      onClick={() => handleFilterChange(selectedCategories, priceRange, "")}
                    >
                      Sort: {sortByPrice} ✕
                    </Badge>
                  )}
                  {priceRange[1] < 10000 && (
                    <Badge 
                      variant="secondary"
                      className="bg-blue-900 text-blue-200 hover:bg-blue-800 cursor-pointer"
                      onClick={() => handleFilterChange(selectedCategories, [0, 10000], sortByPrice)}
                    >
                      Price: ₹{priceRange[0]}-₹{priceRange[1]} ✕
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Results Count */}
            {hasResults && (
              <div className="mb-6">
                <p className="text-gray-400">
                  Found <span className="font-semibold text-white">{data?.courses?.length}</span> course{data?.courses?.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Loading State */}
            {isLoading || isFetching ? (
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <CourseSkeleton key={idx} />
                ))}
              </div>
            ) : isEmpty ? (
              <CourseNotFound query={rawQuery} />
            ) : error ? (
              <CourseError />
            ) : (
              <div className="space-y-6">
                {data?.courses?.map((course) => (
                  <Searchresult key={course._id} course={course} />
                ))}
              </div>
            )}

            {/* No Search Query */}
            {!rawQuery && !isLoading && !error && (
              <div className="text-center py-12">
                <SearchIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Start Searching</h3>
                <p className="text-gray-400 mb-6">
                  Enter a search term above or browse courses by category
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Web Development", "Data Science", "Design", "Business", "Marketing"].map((term) => (
                    <Button
                      key={term}
                      variant="outline"
                      onClick={() => {
                        setLocalQuery(term);
                        setSearchParams({ query: term });
                      }}
                      className="rounded-full"
                    >
                      {term}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

/* SUPPORT COMPONENTS */
const CourseNotFound = ({ query }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="h-20 w-20 rounded-full bg-red-900/30 flex items-center justify-center mb-6">
      <AlertCircle className="h-10 w-10 text-red-500" />
    </div>
    <h1 className="font-bold text-2xl md:text-3xl text-gray-200 mb-3">
      No courses found
    </h1>
    <p className="text-lg text-gray-400 mb-8 max-w-md">
      {query ? `We couldn't find any courses matching "${query}"` : "No courses match your filters"}
    </p>
    <div className="flex flex-wrap gap-3">
      <Link to="/course/search">
        <Button variant="outline">Clear Search</Button>
      </Link>
      <Link to="/">
        <Button>Browse All Courses</Button>
      </Link>
    </div>
  </div>
);

const CourseError = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="h-20 w-20 rounded-full bg-red-900/30 flex items-center justify-center mb-6">
      <AlertCircle className="h-10 w-10 text-red-500" />
    </div>
    <h1 className="font-bold text-2xl md:text-3xl text-gray-200 mb-3">
      Something went wrong
    </h1>
    <p className="text-lg text-gray-400 mb-8">
      Please try again later or contact support
    </p>
    <Button onClick={() => window.location.reload()}>Try Again</Button>
  </div>
);

const CourseSkeleton = () => (
  <div className="flex flex-col md:flex-row gap-4 p-4 border border-gray-800 rounded-xl bg-gray-900">
    <div className="md:w-48">
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
    <div className="flex-1 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-4 w-1/3" />
    </div>
  </div>
);