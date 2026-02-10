import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";

// ✅ USE LOCALHOST ONLY
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const USER_API = `${API_URL}/api/v1/user`;

console.log(`🔗 API URL for auth: ${USER_API}`);

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: USER_API,
    credentials: "include", // IMPORTANT for cookies
    prepareHeaders: (headers, { getState }) => {
      headers.set("Accept", "application/json");
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ['User'],
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
          console.log("✅ Register API Success:", result.data);

          const userData = result.data?.data || result.data || null;
          if (userData) {
            dispatch(userLoggedIn(userData));
          }
        } catch (error) {
          console.error("❌ Register failed:", error);
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
          console.log("✅ Login API Success:", result.data);

          const userData = result.data?.data || result.data || null;

          if (userData) {
            dispatch(userLoggedIn(userData));
          } else {
            console.warn("⚠️ No user data found in login response");
          }
        } catch (error) {
          console.error("❌ Login failed:", error);
        }
      },
      invalidatesTags: ['User'],
    }),

    logoutUser: builder.mutation({
      query: () => ({
        url: "logout",
        method: "GET",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(userLoggedOut());
          dispatch(authApi.util.invalidateTags(['User']));
          console.log("✅ Logout successful");
        } catch (error) {
          console.error("❌ Logout failed:", error);
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
          console.log("✅ Load User API Success:", result.data);

          const userData = result.data?.data || result.data || null;
          if (userData) {
            dispatch(userLoggedIn(userData));
          } else {
            console.warn("⚠️ No user data found in loadUser response");
          }
        } catch (error) {
          console.error("❌ Load user failed:", error);
          // Clear auth state on failure
          dispatch(userLoggedOut());
        }
      },
      providesTags: ['User'],
    }),

    updateUser: builder.mutation({
      query: (formData) => ({
        url: "profile/update",
        method: "PUT",
        body: formData,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          console.log("✅ Update User API Response:", result.data);

          const userData = result.data?.data || result.data || null;
          if (userData) {
            dispatch(userLoggedIn(userData));
          }
        } catch (error) {
          console.error("❌ Update user failed:", error);
        }
      },
      invalidatesTags: ['User'],
    }),

    // ✅ TEST ENDPOINT
    testConnection: builder.query({
      query: () => ({
        url: "/../test", // Adjust based on your test endpoint
        method: "GET",
      }),
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useLoadUserQuery,
  useUpdateUserMutation,
  useTestConnectionQuery,
} = authApi;