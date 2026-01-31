import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Filter as FilterIcon, X, ChevronDown, ChevronUp } from "lucide-react";

const Filter = ({ handleFilterChange }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("");
  const [showCategories, setShowCategories] = useState(true);
  const [showPrice, setShowPrice] = useState(true);

  const categories = [
    "Next JS",
    "Data Science", 
    "Frontend Development",
    "Fullstack Development",
    "MERN Stack Development",
    "Backend Development",
    "Javascript",
    "Python",
    "Docker",
    "MongoDB",
    "HTML"
  ];

  const handleCategoryChange = (category) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    handleFilterChange(newCategories, priceRange, sortBy);
  };

  const handlePriceChange = (value) => {
    setPriceRange(value);
    handleFilterChange(selectedCategories, value, sortBy);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    handleFilterChange(selectedCategories, priceRange, value);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 10000]);
    setSortBy("");
    handleFilterChange([], [0, 10000], "");
  };

  return (
    <div className="w-full bg-gray-900 rounded-xl border border-gray-800 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FilterIcon className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        {(selectedCategories.length > 0 || priceRange[1] < 10000 || sortBy) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-gray-400 hover:text-red-400"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Sort Options */}
      <div className="mb-8">
        <h3 className="font-medium text-gray-100 mb-4">Sort by</h3>
        <div className="flex flex-wrap gap-2">
          {["price-low", "price-high", "rating", "newest"].map((option) => (
            <Button
              key={option}
              variant={sortBy === option ? "default" : "outline"}
              size="sm"
              onClick={() => handleSortChange(sortBy === option ? "" : option)}
              className={`rounded-full ${
                sortBy === option 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'hover:border-blue-500'
              }`}
            >
              {option === "price-low" && "Price: Low to High"}
              {option === "price-high" && "Price: High to Low"}
              {option === "rating" && "Highest Rated"}
              {option === "newest" && "Newest"}
            </Button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8 pb-6 border-b border-gray-800">
        <div 
          className="flex items-center justify-between cursor-pointer mb-4"
          onClick={() => setShowCategories(!showCategories)}
        >
          <h3 className="font-medium text-gray-100">Categories</h3>
          {showCategories ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </div>
        
        {showCategories && (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {categories.map((category) => (
              <div 
                key={category} 
                className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => handleCategoryChange(category)}
              >
                <Checkbox 
                  checked={selectedCategories.includes(category)}
                  className="h-4 w-4"
                />
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                  {category}
                </label>
                {selectedCategories.includes(category) && (
                  <Badge className="ml-auto bg-blue-900 text-blue-200">
                    Selected
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div>
        {/* <div 
          className="flex items-center justify-between cursor-pointer mb-4"
          onClick={() => setShowPrice(!showPrice)}
        >
          <h3 className="font-medium text-gray-100">Price Range</h3>
          {showPrice ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </div> */}
        
        {showPrice && (
          <div className="space-y-4">
            {/* <Slider
              defaultValue={[0, 10000]}
              max={10000}
              step={100}
              value={priceRange}
              onValueChange={handlePriceChange}
              className="w-full"
            /> */}
            <div className="flex items-center justify-between text-sm">
              {/* <span className="text-gray-400">
                ₹{priceRange[0]}
              </span>
              <span className="text-gray-400">
                ₹{priceRange[1]}
              </span> */}
            </div>
            {/* <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePriceChange([0, 5000])}
                className="text-xs"
              >
                Under ₹5000
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePriceChange([5000, 10000])}
                className="text-xs"
              >
                ₹5000+
              </Button>
            </div> */}
          </div>
        )}
      </div>

      {/* Active Filters */}
      {(selectedCategories.length > 0 || priceRange[1] < 10000 || sortBy) && (
        <div className="mt-6 pt-6 border-t border-gray-800">
          <h4 className="font-medium text-sm text-gray-100 mb-2">Active Filters</h4>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <Badge 
                key={category} 
                variant="secondary"
                className="cursor-pointer hover:bg-red-900 hover:text-red-400"
                onClick={() => handleCategoryChange(category)}
              >
                {category}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            {priceRange[1] < 10000 && (
              <Badge 
                variant="secondary"
                className="cursor-pointer hover:bg-red-900 hover:text-red-400"
                onClick={() => handlePriceChange([0, 10000])}
              >
                Price: ₹{priceRange[0]} - ₹{priceRange[1]}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {sortBy && (
              <Badge 
                variant="secondary"
                className="cursor-pointer hover:bg-red-900 hover:text-red-400"
                onClick={() => handleSortChange("")}
              >
                Sort: {sortBy}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;