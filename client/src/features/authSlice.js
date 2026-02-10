import { createSlice } from "@reduxjs/toolkit";

// Load from localStorage for persistence
const loadFromStorage = () => {
  try {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      return JSON.parse(storedAuth);
    }
  } catch (error) {
    console.error("Error loading auth from storage:", error);
  }
  return {
    user: null,
    isAuthenticated: false,
  };
};

const initialState = loadFromStorage();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
      console.log("✅ userLoggedIn action:", action.payload);
      const payload = action.payload;
      
      // Handle different response formats
      state.user = payload?.data || payload?.user || payload || null;
      state.isAuthenticated = true;
      
      // Save to localStorage
      try {
        localStorage.setItem('auth', JSON.stringify(state));
      } catch (error) {
        console.error("Error saving auth to storage:", error);
      }
    },
    userLoggedOut: (state) => {
      console.log("🚪 userLoggedOut action");
      state.user = null;
      state.isAuthenticated = false;
      
      // Clear localStorage
      try {
        localStorage.removeItem('auth');
      } catch (error) {
        console.error("Error clearing auth from storage:", error);
      }
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;