import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    const existingVerifiedUserByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUserByUsername) {
      return Response.json(
        {
          success: false,
          message: 'Username is already taken',
        },
        { status: 400 }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });
    let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: 'User already exists with this email',
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessages: true,
        messages: [],
      });

      await newUser.save();
    }

    // Send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );
    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'User registered successfully. Please verify your account.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering user:', error);
    return Response.json(
      {
        success: false,
        message: 'Error registering user',
      },
      { status: 500 }
    );
  }
}

// import dbConnect from "@/lib/dbConnect";
// import UserModel from "@/model/User";
// import bcrypt from "bcryptjs";
// import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
// import { NextResponse } from "next/server";
// import { signUpSchema } from "@/schemas/signUpSchema";
// import crypto from "crypto";

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();

//     const parsed = signUpSchema.safeParse(body);
//     if (!parsed.success) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: parsed.error.issues.map(e => e.message).join(", "),
//         },
//         { status: 400 }
//       );
//     }

//     const { username, email, password } = parsed.data;

//     await dbConnect();

//     const existingUserVerifiedByUsername = await UserModel.findOne({
//       username,
//       isVerified: true,
//     });

//     if (existingUserVerifiedByUsername) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Username is already taken",
//         },
//         { status: 400 }
//       );
//     }

//     const existingUserByEmail = await UserModel.findOne({ email });

//     const verifyCode = crypto.randomInt(100000, 999999).toString();
//     const verifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000);

//     let user;

//     if (existingUserByEmail) {
//       if (existingUserByEmail.isVerified) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "User already exists with this email",
//           },
//           { status: 400 }
//         );
//       }

//       existingUserByEmail.password = await bcrypt.hash(password, 10);
//       existingUserByEmail.verifyCode = verifyCode;
//       existingUserByEmail.verifyCodeExpiry = verifyCodeExpiry;

//       user = existingUserByEmail;
//     } else {
//       user = new UserModel({
//         username,
//         email,
//         password: await bcrypt.hash(password, 10),
//         verifyCode,
//         verifyCodeExpiry,
//         isVerified: false,
//         isAcceptingMessages: true,
//         messages: [],
//       });
//     }

//     await user.save();

//     const emailResponse = await sendVerificationEmail(
//       email,
//       username,
//       verifyCode
//     );

//     if (!emailResponse.success) {
//       await UserModel.deleteOne({ _id: user._id });

//       return NextResponse.json(
//         {
//           success: false,
//           message: "Failed to send verification email",
//         },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         message: "User registered successfully. Please verify your email",
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error registering user", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Error registering user",
//       },
//       { status: 500 }
//     );
//   }
// }
