import { Edit } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const Lecture = ({ lecture, courseId, index }) => {
  const navigate = useNavigate();

  const goToUpdateLecture = () => {
    navigate(`/admin/courses/${courseId}/lecture/${lecture._id}`);
  };

  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-lg my-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
          {index + 1}
        </div>
        <div>
          <span className="font-semibold text-gray-900 dark:text-white block">
            {lecture.lectureTitle}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Click to edit lecture details
          </span>
        </div>
      </div>

      <button
        onClick={goToUpdateLecture}
        className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        aria-label="Edit lecture"
      >
        <Edit size={20} />
      </button>
    </div>
  );
};

export default Lecture;