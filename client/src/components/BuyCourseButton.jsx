import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { useCreateCheckoutSessionMutation } from "@/features/api/purchaseApi";
import { Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const BuyCourseButton = ({ courseId, onPurchaseSuccess }) => {
  const [
    createCheckoutSession,
    { data, isLoading, isError, error, isSuccess },
  ] = useCreateCheckoutSessionMutation();

  const purchaseCourseHandler = async () => {
    try {
      await createCheckoutSession(courseId);
    } catch (err) {
      console.error("Purchase error:", err);
      toast.error("Failed to initiate purchase. Please try again.");
    }
  };

  useEffect(() => {
    if (isSuccess && data?.url) {
      // Open Stripe in new tab
      const newWindow = window.open(data.url, '_blank');
      
      if (!newWindow) {
        toast.error("Please allow popups to complete purchase");
        return;
      }
      
      // Listen for when the popup closes
      const checkPopupClosed = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(checkPopupClosed);
          
          // Show toast instruction
          toast.success(
            <div className="flex flex-col gap-2">
              <p>Purchase completed! Refreshing page...</p>
              <Button 
                size="sm" 
                onClick={() => {
                  // Call the callback to refresh parent
                  if (onPurchaseSuccess) onPurchaseSuccess();
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Click here if page doesn't refresh
              </Button>
            </div>,
            { duration: 10000 }
          );
          
          // Trigger parent refresh after popup closes
          setTimeout(() => {
            if (onPurchaseSuccess) onPurchaseSuccess();
          }, 2000);
        }
      }, 1000);
      
      // Also set up a backup check in case user doesn't close the popup
      setTimeout(() => {
        clearInterval(checkPopupClosed);
        toast.info(
          "If you completed the purchase, please refresh the page to see your course.",
          { duration: 8000 }
        );
      }, 30000);
    }

    if (isSuccess && !data?.url) {
      toast.error("Invalid response from server.");
    }

    if (isError) {
      toast.error(error?.data?.message || "Failed to create checkout session");
    }
  }, [data, isSuccess, isError, error, onPurchaseSuccess]);

  return (
    <Button
      disabled={isLoading}
      onClick={purchaseCourseHandler}
      className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl rounded-lg border-2 border-blue-500/20"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        "Purchase Course"
      )}
    </Button>
  );
};

export default BuyCourseButton;