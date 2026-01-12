// import dbConnect from "@/lib/dbConnect";
// import UserModel from "@/model/User";

// export async function POST(request: Request) {
//   await dbConnect();

//   try {
//     const { username, code } = await request.json();

//     const decodedUsername = decodeURIComponent(username);
//     const user = await UserModel.findOne({ username: decodedUsername });

//     if (!user) {
//       return Response.json(
//         {
//           success: false,
//           message: "User not found",
//         },
//         { status: 500 }
//       );
//     }

//     const isCodeValid = user.verifyCode === code;
//     const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

//     if (isCodeValid && isCodeNotExpired) {
//       user.isVerified = true;
//       await user.save();

//       return Response.json(
//         {
//           success: true,
//           message: "Account verified successfully",
//         },
//         { status: 200 }
//       );
//     } else if (!isCodeNotExpired) {
//       return Response.json(
//         {
//           success: false,
//           message:
//             "Verification code has expired please signup again to get a new code",
//         },
//         { status: 400 }
//       );
//     } else {
//       return Response.json(
//         {
//           success: false,
//           message: "Incorrect Verification code",
//         },
//         { status: 400 }
//       );
//     }
//   } catch (error) {
//     console.error("Error verifying user", error);
//     return Response.json(
//       {
//         success: false,
//         message: "Error verifying user",
//       },
//       { status: 500 }
//     );
//   }
// }

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";
import { z } from "zod";

const verifySchema = z.object({
  username: z.string().min(1),
  code: z.string().length(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues.map(i => i.message).join(", "),
        },
        { status: 400 }
      );
    }

    const { username, code } = parsed.data;

    await dbConnect();

    const user = await UserModel.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { success: false, message: "Account already verified" },
        { status: 400 }
      );
    }

    const isCodeValid = String(user.verifyCode) === String(code);
    const isCodeNotExpired =
      user.verifyCodeExpiry && user.verifyCodeExpiry > new Date();

    if (!isCodeValid) {
      return NextResponse.json(
        { success: false, message: "Incorrect verification code" },
        { status: 400 }
      );
    }

    if (!isCodeNotExpired) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification code expired. Please sign up again.",
        },
        { status: 400 }
      );
    }

    user.isVerified = true;
    user.verifyCode = undefined;
    user.verifyCodeExpiry = undefined;

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Account verified successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying user", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error verifying user",
      },
      { status: 500 }
    );
  }
}
