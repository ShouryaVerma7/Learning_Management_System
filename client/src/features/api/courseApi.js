// frontend/src/features/api/courseApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_API = "http://localhost:8080/api/v1";

export const courseApi = createApi({
  reducerPath: "courseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API,
    credentials: 'include',
  }),
  tagTypes: ["Course", "Lecture"],
  endpoints: (builder) => ({

    createCourse: builder.mutation({
      query: ({ courseTitle, category }) => ({
        url: "/courses",
        method: "POST",
        body: { courseTitle, category },
      }),
      invalidatesTags: ["Course"],
    }),

    getSearchCourse: builder.query({
      // arg: { query, categories, sortByPrice }
      query: ({ query = "", categories = [], sortByPrice = "" } = {}) => {
        let queryString = `/courses/search?query=${encodeURIComponent(query)}`;

        if (categories && categories.length > 0) {
          const categoriesString = categories.map(encodeURIComponent).join(",");
          queryString += `&categories=${categoriesString}`;
        }

        if (sortByPrice) queryString += `&sortByPrice=${encodeURIComponent(sortByPrice)}`;

        return {
          url: queryString,
          method: "GET",
        };
      },
      // don't provide tags here (read-only)
    }),

    getPublishedCourse: builder.query({
      query: () => ({ url: "/courses/published-courses", method: "GET" })
    }),

    getCreatorCourse: builder.query({
      query: () => ({ url: "/courses", method: "GET" }),
      providesTags: ["Course"]
    }),

    editCourse: builder.mutation({
      query: ({ formData, courseId }) => ({
        url: `/courses/${courseId}`,
        method: "PUT",
        body: formData
      }),
      invalidatesTags: ["Course"],
    }),

    getCourseById: builder.query({
      query: (courseId) => ({ url: `/courses/${courseId}`, method: "GET" }),
      providesTags: (result, error, courseId) => [{ type: "Course", id: courseId }]
    }),

    createLecture: builder.mutation({
      query: ({ lectureTitle, courseId }) => ({
        url: `/courses/${courseId}/lecture`,
        method: "POST",
        body: { lectureTitle }
      }),
      invalidatesTags: ["Lecture"]
    }),

    getCourseLecture: builder.query({
      query: (courseId) => ({ url: `/courses/${courseId}/lecture`, method: "GET" }),
      providesTags: ["Lecture"]
    }),

    editLecture: builder.mutation({
      query: ({ lectureTitle, videoInfo, isPreviewFree, courseId, lectureId }) => ({
        url: `/courses/${courseId}/lecture/${lectureId}`,
        method: "POST",
        body: { lectureTitle, videoInfo, isPreviewFree }
      }),
      invalidatesTags: ["Lecture"]
    }),

    removeLecture: builder.mutation({
      query: (lectureId) => ({ url: `/courses/lecture/${lectureId}`, method: "DELETE" }),
      invalidatesTags: ["Lecture"]
    }),

    getLectureById: builder.query({
      query: (lectureId) => ({ url: `/courses/lecture/${lectureId}`, method: "GET" }),
      providesTags: ["Lecture"]
    }),

    publishCourse: builder.mutation({
      query: ({ courseId, publish }) => ({
        url: `/courses/${courseId}/publish?publish=${encodeURIComponent(publish)}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Course"]
    }),

    removeCourse: builder.mutation({
      query: (courseId) => ({ url: `/courses/${courseId}`, method: "DELETE" }),
      invalidatesTags: ["Course"]
    }),
  })
});

export const {
  useCreateCourseMutation,
  useGetSearchCourseQuery,
  useGetPublishedCourseQuery,
  useGetCreatorCourseQuery,
  useEditCourseMutation,
  useGetCourseByIdQuery,
  useCreateLectureMutation,
  useEditLectureMutation,
  useGetCourseLectureQuery,
  useRemoveLectureMutation,
  useGetLectureByIdQuery,
  usePublishCourseMutation,
  useRemoveCourseMutation
} = courseApi;
