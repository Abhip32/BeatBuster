import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import User from "@/models/User";
import dbConnect from "@/utils/dbconnect";
import UserData from "@/models/UserData";

export const dynamic = "force-dynamic";

// Get user data
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
        { success: false, message: "Database offline", data: null },
        { status: 503 }
      );
    }
    const user = await User.findOne({ email: token.email });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
          data: null,
        },
        { status: 404 }
      );
    }
    const userData = await UserData.findById(user.userData);
    if (!userData) {
      return NextResponse.json(
        {
          success: false,
          message: "User data not found",
          data: null,
        },
        { status: 404 }
      );
    }

    // Deduplicate and sanitize favourites (filter out corrupted/empty entries)
    const seen = new Set();
    const uniqueFavs = [];
    for (const item of (userData.favourites || [])) {
      if (!item) continue;
      const rawId = typeof item === "object" ? item?.id : item;
      const sid = typeof rawId === "string" ? rawId.trim() : String(rawId || "");
      if (sid && sid !== "undefined" && sid !== "null" && !seen.has(sid)) {
        seen.add(sid);
        uniqueFavs.push(item);
      }
    }
    if (uniqueFavs.length !== (userData.favourites || []).length) {
      userData.favourites = uniqueFavs;
      userData.markModified("favourites");
      await userData.save();
    } else {
      userData.favourites = uniqueFavs;
    }

    return NextResponse.json({
      success: true,
      message: "User Data found",
      data: userData,
    });
  } catch (e) {
    console.error("get user data error", e);
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

// Add to favourites
export async function POST(request) {
  const token = await getToken({
    req: request,
    secret: process.env.JWT_SECRET,
  });
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
  const { id } = await request.json();
  try {
    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json(
        { success: false, message: "Database offline", data: null },
        { status: 503 }
      );
    }
    const user = await User.findOne({ email: token.email });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
          data: null,
        },
        { status: 404 }
      );
    }
    const userData = await UserData.findById(user.userData);
    if (!userData) {
      return NextResponse.json(
        {
          success: false,
          message: "User data not found",
          data: null,
        },
        { status: 404 }
      );
    }
    // Clean and deduplicate existing favourites
    const seen = new Set();
    const uniqueFavs = [];
    for (const item of (userData.favourites || [])) {
      if (!item) continue;
      const rawId = typeof item === "object" ? item?.id : item;
      const sid = typeof rawId === "string" ? rawId.trim() : String(rawId || "");
      if (sid && sid !== "undefined" && sid !== "null" && !seen.has(sid)) {
        seen.add(sid);
        uniqueFavs.push(item);
      }
    }
    userData.favourites = uniqueFavs;

    const rawTarget = typeof id === "object" ? id?.id : id;
    const targetId = typeof rawTarget === "string" ? rawTarget.trim() : String(rawTarget || "");

    if (!targetId || targetId === "undefined" || targetId === "null") {
      return NextResponse.json(
        { success: false, message: "Invalid song ID", data: userData },
        { status: 400 }
      );
    }

    const isAlreadyFav = (userData.favourites || []).some((item) => {
      const sid = typeof item === "object" ? item?.id : item;
      return String(sid || "").trim() === targetId;
    });

    if (isAlreadyFav) {
      // Remove all instances of this song (toggle off)
      userData.favourites = userData.favourites.filter((item) => {
        const sid = typeof item === "object" ? item?.id : item;
        return String(sid || "").trim() !== targetId;
      });
    } else {
      // Add it (toggle on)
      userData.favourites.push(id);
    }
    userData.markModified("favourites");
    await userData.save();

    return NextResponse.json({
      success: true,
      message: isAlreadyFav ? "Removed from favourites" : "Added to favourites",
      data: userData,
    });
  } catch (e) {
    console.log("add to favourites error", e);
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
