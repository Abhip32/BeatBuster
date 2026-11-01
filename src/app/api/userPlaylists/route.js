import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import User from "@/models/User";
import dbConnect from "@/utils/dbconnect";
import Playlist from "@/models/Playlist";
import UserData from "@/models/UserData";
import auth from "@/utils/auth";

export const dynamic = "force-dynamic";

// Create a new playlist
export async function POST(req) {
  const { name } = await req.json();
  try {
    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json(
        { success: false, message: "Database offline", data: null },
        { status: 503 }
      );
    }
    const user = await auth(req);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not logged in",
          data: null,
        },
        { status: 401 }
      );
    }
    const playlist = await Playlist.create({
      name,
      user: user._id,
    });

    const userData = await UserData.findById(user.userData);
    if (userData) {
      userData.playlists.push(playlist._id);
      await userData.save();
    }
    return NextResponse.json({
      success: true,
      message: "Playlist created",
      data: { playlist },
    });
  } catch (e) {
    console.error(e);
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

// delete a playlist (supports single or bulk delete)
export async function DELETE(req) {
  try {
    const body = await req.json();
    const playlistId = body?.playlistId;
    const rawIds = Array.isArray(body?.playlistIds)
      ? body.playlistIds
      : playlistId
      ? [playlistId]
      : [];
    const playlistIds = rawIds.filter((id) => id && typeof id === "string");

    if (playlistIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "No playlist ID provided", data: null },
        { status: 400 }
      );
    }

    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json(
        { success: false, message: "Database offline", data: null },
        { status: 503 }
      );
    }
    const user = await auth(req);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not logged in",
          data: null,
        },
        { status: 401 }
      );
    }

    // Only match playlists belonging to this user
    const userPlaylistsToDelete = await Playlist.find({
      _id: { $in: playlistIds },
      user: user._id,
    }).select("_id");

    const validIds = userPlaylistsToDelete.map((p) => p._id.toString());

    if (validIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No matching playlists found to delete",
          data: null,
        },
        { status: 404 }
      );
    }

    await Playlist.deleteMany({ _id: { $in: validIds } });

    const userData = await UserData.findById(user.userData);
    if (userData && Array.isArray(userData.playlists)) {
      const validSet = new Set(validIds);
      userData.playlists = userData.playlists.filter(
        (p) => !validSet.has(p.toString())
      );
      await userData.save();
    }

    return NextResponse.json({
      success: true,
      message:
        validIds.length === 1
          ? "Playlist deleted"
          : `${validIds.length} playlists deleted`,
      deletedCount: validIds.length,
      deletedIds: validIds,
      data: null,
    });
  } catch (e) {
    console.error("Delete playlist error:", e);
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

// get all playlists
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
    const userData = await UserData.findById(user.userData).populate(
      "playlists"
    );
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
    return NextResponse.json({
      success: true,
      message: "Playlists fetched",
      data: {
        playlists: userData.playlists,
      },
    });
  } catch (e) {
    console.error(e);
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
