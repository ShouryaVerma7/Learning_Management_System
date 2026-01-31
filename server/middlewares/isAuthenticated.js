// middlewares/isAuthenticated.js
import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const decode = await jwt.verify(token, process.env.SECRET_KEY);
    req.id = decode.userId;
    next();
    
  } catch (error) {
    console.log("Auth middleware error:", error);
    
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
    });
  }
};

export default isAuthenticated;