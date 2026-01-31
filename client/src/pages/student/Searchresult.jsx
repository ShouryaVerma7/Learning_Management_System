// frontend/src/components/Searchresult.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Searchresult = ({ course }) => {
  const title = course.courseTitle || "(No title)";
  const subtitle = course.subtitle ;
  const thumbnail = course.courseThumbnail || "https://via.placeholder.com/300x180";
  const instructor = course.creator?.name || "Unknown";
  const level = course.courseLevel || "N/A";

  return (
    <div className="border-b border-gray-300 pb-4">
      <Link to={`/course-detail/${course._id}`} className="flex gap-4">
        <img className="h-32 w-56 object-cover rounded" src={thumbnail} alt={title} />
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-xl">{title}</h1>
          <p className="text-sm text-gray-600">{subtitle}</p>
          <p className="text-sm text-gray-700">
            Instructor: <span className="font-bold">{instructor}</span>
          </p>
          <Badge className="w-fit mt-1">{level}</Badge>
        </div>
      </Link>
      <div className="mt-4 md:mt-0 md:text-right w-full md:w-auto">
        <h1 className="font-bold text-lg md:xl">₹{course.coursePrice}</h1>
      </div>
    </div>
  );
};

export default Searchresult;
