import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import Jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill all the fields",
          data: null,
        },
        { status: 400 }
      );
    }
    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection unavailable. Please check MongoDB configuration.",
          data: null,
        },
        { status: 503 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User does not exist",
          data: null,
        },
        { status: 400 }
      );
    }
    const isPasswordCorrect = user.password && (await bcrypt.compare(password, user.password));
    if (!isPasswordCorrect) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
          data: null,
        },
        { status: 400 }
      );
    }
    const secret = process.env.JWT_SECRET || "musify-secret-key-32charslongdefault";
    const token = Jwt.sign({ email: user.email, id: user._id }, secret, {
      expiresIn: "30d",
    });
    const response = NextResponse.json({
      success: true,
      message: "User logged in successfully",
      data: { token },
    });
    response.cookies.set("token", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60,
    });
    return response;
  } catch (e) {
    console.error("Login route error:", e);
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
