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

// import dbConnect from "@/lib/dbConnect";
// import UserModel from "@/model/User";
// import { NextResponse } from "next/server";
// import { z } from "zod";

// const verifySchema = z.object({
//   username: z.string().min(1),
//   code: z.string().length(6),
// });

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const parsed = verifySchema.safeParse(body);

//     if (!parsed.success) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: parsed.error.issues.map(i => i.message).join(", "),
//         },
//         { status: 400 }
//       );
//     }

//     const { username, code } = parsed.data;

//     await dbConnect();

//     const user = await UserModel.findOne({ username });

//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: "User not found" },
//         { status: 404 }
//       );
//     }

//     if (user.isVerified) {
//       return NextResponse.json(
//         { success: false, message: "Account already verified" },
//         { status: 400 }
//       );
//     }

//     const isCodeValid = String(user.verifyCode) === String(code);
//     const isCodeNotExpired =
//       user.verifyCodeExpiry && user.verifyCodeExpiry > new Date();

//     if (!isCodeValid) {
//       return NextResponse.json(
//         { success: false, message: "Incorrect verification code" },
//         { status: 400 }
//       );
//     }

//     if (!isCodeNotExpired) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Verification code expired. Please sign up again.",
//         },
//         { status: 400 }
//       );
//     }

//     user.isVerified = true;
//     user.verifyCode = undefined;
//     user.verifyCodeExpiry = undefined;

//     await user.save();

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Account verified successfully",
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error verifying user", error);
//     return NextResponse.json(
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
    console.log('=== VERIFY CODE DEBUG ===');
    
    const body = await request.json();
    console.log('1. Request body:', body);
    
    const parsed = verifySchema.safeParse(body);
    console.log('2. Validation result:', parsed.success ? 'Valid' : 'Invalid');

    if (!parsed.success) {
      console.log('2a. Validation errors:', parsed.error.issues);
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues.map(i => i.message).join(", "),
        },
        { status: 400 }
      );
    }

    const { username, code } = parsed.data;
    console.log('3. Username:', username);
    console.log('4. Code received:', code);

    await dbConnect();
    console.log('5. Database connected');

    const user = await UserModel.findOne({ username });
    console.log('6. User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('6a. User not found');
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    console.log('7. User email:', user.email);
    console.log('8. User isVerified:', user.isVerified);
    console.log('9. DB verifyCode:', user.verifyCode);
    console.log('10. DB verifyCodeExpiry:', user.verifyCodeExpiry);

    if (user.isVerified) {
      console.log('10a. Account already verified');
      return NextResponse.json(
        { success: false, message: "Account already verified" },
        { status: 400 }
      );
    }

    // Convert both to strings and trim
    const dbCode = String(user.verifyCode).trim();
    const receivedCode = String(code).trim();
    
    console.log('11. DB code (trimmed):', dbCode);
    console.log('12. Received code (trimmed):', receivedCode);
    console.log('13. Codes match:', dbCode === receivedCode);

    const isCodeValid = dbCode === receivedCode;
    const isCodeNotExpired = user.verifyCodeExpiry && user.verifyCodeExpiry > new Date();

    console.log('14. Code valid:', isCodeValid);
    console.log('15. Code not expired:', isCodeNotExpired);
    console.log('16. Current time:', new Date());
    console.log('17. Expiry time:', user.verifyCodeExpiry);

    if (!isCodeValid) {
      console.log('❌ Incorrect verification code');
      return NextResponse.json(
        { success: false, message: "Incorrect verification code" },
        { status: 400 }
      );
    }

    if (!isCodeNotExpired) {
      console.log('❌ Verification code expired');
      return NextResponse.json(
        {
          success: false,
          message: "Verification code expired. Please sign up again.",
        },
        { status: 400 }
      );
    }

    console.log('18. Updating user...');
    user.isVerified = true;
    user.verifyCode = undefined;
    user.verifyCodeExpiry = undefined;

    await user.save();
    console.log('✅ User verified successfully');

    return NextResponse.json(
      {
        success: true,
        message: "Account verified successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ CRITICAL ERROR:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      {
        success: false,
        message: "Error verifying user",
      },
      { status: 500 }
    );
  }
}