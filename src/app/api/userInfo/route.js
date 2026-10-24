import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import User from "@/models/User";
import dbConnect from "@/utils/dbconnect";

export const dynamic = "force-dynamic";

// Get user info
export async function GET(req) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });
  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "User not logged in",
        data: null,
      },
      { status: 401 }
    );
  }
  try {
    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json(
        {
          success: true,
          message: "User session active (offline DB)",
          data: {
            userName: token.name || "User",
            email: token.email,
            imageUrl: token.picture || "/default-avatar.png",
            isVerified: true,
          },
        },
        { status: 200 }
      );
    }
    const user = await User.findOne({ email: token.email });
    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message: "User session active",
          data: {
            userName: token.name || "User",
            email: token.email,
            imageUrl: token.picture || "/default-avatar.png",
            isVerified: true,
          },
        },
        { status: 200 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "User found",
      data: {
        userName: user.userName,
        email: user.email,
        imageUrl: user.imageUrl,
        isVerified: user.isVerified,
      },
    });
  } catch (e) {
    console.error("User info error:", e);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
        data: null,
      },
      { status: 500 }
    );
  }
}
