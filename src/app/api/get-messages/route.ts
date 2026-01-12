// import dbConnect from '@/lib/dbConnect';
// import UserModel from '@/model/User';
// import mongoose from 'mongoose';
// import { User } from 'next-auth';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../auth/[...nextauth]/options';

// export async function GET(request: Request) {
//   await dbConnect();
//   const session = await getServerSession(authOptions);
//   const _user: User = session?.user;

//   if (!session || !_user) {
//     return Response.json(
//       { success: false, message: 'Not authenticated' },
//       { status: 401 }
//     );
//   }
//   const userId = new mongoose.Types.ObjectId(_user._id);
//   try {
//     const user = await UserModel.aggregate([
//       { $match: { _id: userId } },
//       { $unwind: '$messages' },
//       { $sort: { 'messages.createdAt': -1 } },
//       { $group: { _id: '$_id', messages: { $push: '$messages' } } },
//     ]).exec();

//     if (!user || user.length === 0) {
//       return Response.json(
//         { message: 'User not found', success: false },
//         { status: 404 }
//       );
//     }

//     return Response.json(
//       { messages: user[0].messages },
//       {
//         status: 200,
//       }
//     );
//   } catch (error) {
//     console.error('An unexpected error occurred:', error);
//     return Response.json(
//       { message: 'Internal server error', success: false },
//       { status: 500 }
//     );
//   }
// }

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    await dbConnect();

    const user = await UserModel.findById(
      session.user._id,
      "messages"
    ).lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Sort messages newest first
    const messages = [...user.messages].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    return NextResponse.json(
      {
        success: true,
        messages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

