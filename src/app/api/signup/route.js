import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import UserData from "@/models/UserData";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { userName, email, password, imageUrl } = await request.json();
    if (!userName || !email || !password || !imageUrl) {
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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists",
          data: null,
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = await UserData.create({});
    const result = await User.create({
      userName,
      email,
      password: hashedPassword,
      imageUrl,
      userData: userData._id,
    });
    return NextResponse.json({
      success: true,
      message: "User created successfully",
      data: result,
    });
  } catch (e) {
    console.error("Signup route error:", e);
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
