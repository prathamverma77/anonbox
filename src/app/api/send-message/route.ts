// import UserModel from '@/model/User';
// import dbConnect from '@/lib/dbConnect';
// import { Message } from '@/model/User';

// export async function POST(request: Request) {
//   await dbConnect();
//   const { username, content } = await request.json();

//   try {
//     const user = await UserModel.findOne({ username }).exec();

//     if (!user) {
//       return Response.json(
//         { message: 'User not found', success: false },
//         { status: 404 }
//       );
//     }

//     // Check if the user is accepting messages
//     if (!user.isAcceptingMessages) {
//       return Response.json(
//         { message: 'User is not accepting messages', success: false },
//         { status: 403 } // 403 Forbidden status
//       );
//     }

//     const newMessage = { content, createdAt: new Date() };

//     // Push the new message to the user's messages array
//     user.messages.push(newMessage as Message);
//     await user.save();

//     return Response.json(
//       { message: 'Message sent successfully', success: true },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error('Error adding message:', error);
//     return Response.json(
//       { message: 'Internal server error', success: false },
//       { status: 500 }
//     );
//   }
// }
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { z } from "zod";

const messageSchema = z.object({
  username: z.string().min(1),
  content: z.string().min(1).max(500),
});

function sanitize(text: string) {
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = messageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues.map(i => i.message).join(", "),
        },
        { status: 400 }
      );
    }

    const username = parsed.data.username.trim();
    const content = sanitize(parsed.data.content.trim());

    await dbConnect();

    const user = await UserModel.findOne({
      username: new RegExp(`^${username}$`, "i"),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (!user.isAcceptingMessages) {
      return NextResponse.json(
        { success: false, message: "User is not accepting messages" },
        { status: 409 }
      );
    }

    user.messages.push({
      content,
      createdAt: new Date(),
    });

    await user.save();

    return NextResponse.json(
      { success: true, message: "Message sent successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding message:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
