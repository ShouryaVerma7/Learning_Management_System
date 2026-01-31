import {configureStore} from "@reduxjs/toolkit"
import rootReducer from "./rootReducer"
import { authApi } from "@/features/api/authApi"
import { courseApi } from "@/features/api/courseApi"
import { purchaseApi } from "@/features/api/purchaseApi"
import { courseProgressApi } from "@/features/api/courseProgressApi"

export const appStore = configureStore({
    reducer: rootReducer,
    middleware:(getDefaultMiddleware) => 
        getDefaultMiddleware().concat(authApi.middleware, courseApi.middleware,purchaseApi.middleware, courseProgressApi.middleware)
})

// Fix the initialization
const initializeApp = async () => { 
    try {
        await appStore.dispatch(authApi.endpoints.loadUser.initiate({}, {forceRefetch: true}))
    } catch (error) {
        console.log("Initial user load failed:", error)
    }
}

initializeApp();