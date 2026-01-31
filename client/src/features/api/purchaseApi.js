import {createApi, fetchBaseQuery}  from "@reduxjs/toolkit/query/react"

const COURSE_PURCHASE_API = "http://localhost:8080/api/v1/purchase"

export const purchaseApi = createApi({
    reducerPath: "purchaseApi",
    baseQuery:fetchBaseQuery({
        baseUrl:COURSE_PURCHASE_API,
        credentials:'include'
    }),
    tagTypes: ["Purchase"],
    endpoints:(builder)=>({
        createCheckoutSession: builder.mutation({
            query:(courseId)=>({
                url:"/checkout/create-checkout-session",
                method:"POST",
                body:{courseId}
            }),
            invalidatesTags: ["Purchase"]
        }),
        
        getCourseDetailWithStatus: builder.query({
            query:(courseId)=>({
                url:`/course/${courseId}/detail-with-status`,
                method:"GET"
            }),
            providesTags: (result, error, courseId) => [
                { type: "Purchase", id: courseId }
            ]
        }),
        
        getPurchasedCourses: builder.query({
            query:()=>({
                url:`/`,
                method:"GET"
            }),
            providesTags: ["Purchase"]
        }),

        // ADD THIS: Verify payment status
        verifyPurchaseStatus: builder.query({
            query:(courseId)=>({
                url:`/verify-purchase/${courseId}`,
                method:"GET"
            })
        }),

        // ADD THIS: Handle Stripe callback
        handleStripeCallback: builder.mutation({
            query:(sessionId)=>({
                url:`/stripe-callback`,
                method:"POST",
                body:{sessionId}
            }),
            invalidatesTags: ["Purchase"]
        })
    })
})

export const {
    useCreateCheckoutSessionMutation,
    useGetCourseDetailWithStatusQuery,
    useGetPurchasedCoursesQuery,
    useVerifyPurchaseStatusQuery, // Add this
    useHandleStripeCallbackMutation // Add this
} = purchaseApi