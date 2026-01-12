// import dbConnect from "@/lib/dbConnect";
// import UserModel from "@/model/User";
// import {z} from "zod";
// import { usernameValidation } from "@/schemas/signUpSchema";
// import { clearScreenDown } from "readline";


// const UsernameQuerySchema = z.object({
//     username: usernameValidation
// })

// export async function GET(request: Request) {    
//     await dbConnect()

//     try{
//         const {searchParams} = new URL (request.url)
//         const queryParam = {
//             username: searchParams.get('username')
//         }
//         //validate with zod 
//         const result = UsernameQuerySchema.safeParse(queryParam)
//         console.log(result) // remove later
//         if(!result.success) {
//             const usernameErrors = result.error.format().username?._errors || []
//             return Response.json({
//                 success: false,
//                 message: usernameErrors?.length > 0 ? usernameErrors.join(', '): 'Invalid query parameters',

//             }, {status: 400})
//         }


//         const {username} = result.data

//         const existingVerifiedUser = await UserModel.findOne({username, isVerified: true})

//         if(existingVerifiedUser) {
//             return Response.json({
//                 success: false,
//                 message: 'Username is alreay taken',
//             }, {status: 400})
//         }

//         return Response.json({
//                 success: true,
//                 message: 'Username is unique',
//             }, {status: 400})

//     } catch (error) {
//         console.error("Error checking usename", error)
//         return Response.json(
//             {
//                 success: false,
//                 message:"Error checking username"
//             },
//             { status:500 }
//         )
//     }
// }

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";
import { NextResponse } from "next/server";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const queryParam = {
      username: searchParams.get("username") ?? "",
    };

    // Validate BEFORE DB call
    const result = UsernameQuerySchema.safeParse(queryParam);

    if (!result.success) {
      const formattedErrors = result.error.format();
      const usernameErrors = formattedErrors.username?._errors;

      return NextResponse.json(
        {
          success: false,
          message:
            usernameErrors?.length
              ? usernameErrors.join(", ")
              : "Invalid query parameters",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    const { username } = result.data;

    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Username is available",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking username:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error checking username",
      },
      { status: 500 }
    );
  }
}
