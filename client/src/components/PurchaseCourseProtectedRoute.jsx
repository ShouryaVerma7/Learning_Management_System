import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { useLoadUserQuery } from "@/features/api/authApi";
import { useParams, Navigate } from "react-router-dom"
import { useEffect, useState } from "react";

const PurchaseCourseProtectedRoute = ({children}) => {
    const {courseId} = useParams();
    const [canAccess, setCanAccess] = useState(false);
    const [checking, setChecking] = useState(true);
    
    // Get course purchase status
    const {data: purchaseData, isLoading: purchaseLoading, refetch: refetchPurchase} = useGetCourseDetailWithStatusQuery(courseId, {
        refetchOnMountOrArgChange: true
    });
    
    // Get user data to check enrolled courses
    const {data: userData, isLoading: userLoading, refetch: refetchUser} = useLoadUserQuery(undefined, {
        refetchOnMountOrArgChange: true
    });

    useEffect(() => {
        const checkAccess = async () => {
            setChecking(true);
            
            // Method 1: Check from purchase API
            const purchasedFromAPI = purchaseData?.purchased === true;
            
            // Method 2: Check from user's enrolled courses
            let purchasedFromUser = false;
            if (userData) {
                const user = userData?.data || userData?.user || userData;
                const enrolledCourses = user?.enrolledCourses || [];
                
                console.log("User enrolled courses:", enrolledCourses);
                
                // Check if course is in enrolled courses
                purchasedFromUser = enrolledCourses.some(course => {
                    const courseIdToCheck = course._id || course.course?._id || course.courseId;
                    console.log("Checking course:", courseIdToCheck, "against:", courseId);
                    return courseIdToCheck === courseId;
                });
            }
            
            // Method 3: Check localStorage as immediate backup
            const purchasedCourses = JSON.parse(localStorage.getItem('purchasedCourses') || '[]');
            const purchasedFromStorage = purchasedCourses.includes(courseId);
            
            console.log("Access Check Results:");
            console.log("- Purchase API data:", purchaseData);
            console.log("- Purchased from API:", purchasedFromAPI);
            console.log("- Purchased from User:", purchasedFromUser);
            console.log("- Purchased from Storage:", purchasedFromStorage);
            console.log("- User Data:", userData);
            
            // Allow access if ANY source says purchased
            const hasAccess = purchasedFromAPI || purchasedFromUser || purchasedFromStorage;
            setCanAccess(hasAccess);
            setChecking(false);
            
            // If localStorage says purchased but API doesn't, refetch API
            if (purchasedFromStorage && (!purchasedFromAPI || !purchasedFromUser)) {
                console.log("LocalStorage says purchased but API doesn't, refetching...");
                setTimeout(() => {
                    refetchPurchase();
                    refetchUser();
                }, 1000);
            }
        };
        
        if (!purchaseLoading && !userLoading) {
            checkAccess();
        }
    }, [purchaseData, userData, purchaseLoading, userLoading, courseId, refetchPurchase, refetchUser]);

    if (purchaseLoading || userLoading || checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-400">Checking course access...</p>
                </div>
            </div>
        );
    }

    console.log("Final Access Decision:", canAccess);
    
    return canAccess ? children : <Navigate to={`/course-detail/${courseId}`} replace />;
}

export default PurchaseCourseProtectedRoute;