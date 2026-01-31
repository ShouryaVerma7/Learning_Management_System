import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice"; // IMPORT userLoggedOut

const USER_API = "http://localhost:8080/api/v1/user/";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: USER_API,
    credentials: "include",
  }),
  tagTypes: ['User'], // ADD THIS
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (inputData) => ({
        url: "register",
        method: "POST",
        body: inputData,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          console.log("Register API Success - Data received:", result.data);

          const userData = result.data?.user || result.data?.data || result.data || null;
          if (userData) {
            dispatch(userLoggedIn(userData));
          }
        } catch (error) {
          console.error("Register failed:", error);
        }
      },
    }),

    loginUser: builder.mutation({
      query: (inputData) => ({
        url: "login",
        method: "POST",
        body: inputData,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          console.log("Login API Success - Data received:", result.data);

          const userData = result.data?.user || result.data?.data || result.data || null;

          if (userData) {
            dispatch(userLoggedIn(userData));
          } else {
            console.warn("No user data found in login response:", result.data);
          }
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
      invalidatesTags: ['User'], // ADD THIS
    }),

    logoutUser: builder.mutation({
      query: () => ({
        url: "logout",
        method: "GET",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Dispatch logout action to clear Redux state
          dispatch(userLoggedOut());
          // Clear the cache for User tag
          dispatch(authApi.util.invalidateTags(['User']));
        } catch (error) {
          console.error("Logout failed:", error);
        }
      },
    }),

    loadUser: builder.query({
      query: () => ({
        url: "profile",
        method: "GET",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          console.log("Load User API Success:", result.data);

          const userData = result.data?.user || result.data?.data || result.data || null;
          if (userData) {
            dispatch(userLoggedIn(userData));
          } else {
            console.warn("No user data found in loadUser response:", result.data);
          }
        } catch (error) {
          console.error("Load user failed:", error);
        }
      },
      providesTags: ['User'], // ADD THIS
    }),

    updateUser: builder.mutation({
      query: (formData) => ({
        url: "profile/update",
        method: "PUT",
        body: formData,
        credentials: "include",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          console.log("Update User API Response:", result.data);

          const userData = result.data?.user || result.data?.data || result.data || null;
          if (userData) {
            dispatch(userLoggedIn(userData));
          }
        } catch (error) {
          console.error("Update user failed:", error);
        }
      },
      invalidatesTags: ['User'], // ADD THIS
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useLoadUserQuery,
  useUpdateUserMutation,
} = authApi;