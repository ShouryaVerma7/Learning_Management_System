import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    console.log("Auth middleware - Cookies received:", req.cookies);
    console.log("Auth middleware - Headers:", req.headers);
    
    const token = req.cookies?.token;
    
    // Also check Authorization header as fallback
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        message: "User not authenticated - No token found",
        success: false,
      });
    }

    const decode = await jwt.verify(token, process.env.SECRET_KEY);
    console.log("Auth middleware - Token decoded:", decode);
    
    req.id = decode.userId;
    next();
    
  } catch (error) {
    console.log("Auth middleware error:", error.message);
    
    // Clear invalid cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
        success: false,
      });
    }

    return res.status(500).json({
      message: "Authentication failed",
      success: false,
      error: error.message,
    });
  }
};

export default isAuthenticated;