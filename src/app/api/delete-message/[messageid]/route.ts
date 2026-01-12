import UserModel from '@/model/User';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import { User } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import mongoose from 'mongoose';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ messageid: string }> }
) {
  console.log('🔍 DELETE route hit');
  
  // AWAIT params (Next.js 15 requirement)
  const { messageid } = await context.params;
  
  console.log(' Received messageid:', messageid);
  
  await dbConnect();
  console.log(' Database connected');
  
  const session = await getServerSession(authOptions);
  const _user: User = session?.user;
  
  if (!session || !_user) {
    console.log(' Not authenticated');
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  console.log('🔍 User ID:', _user._id);
  console.log('🔍 Message ID:', messageid);

  try {
    // Convert to ObjectId for MongoDB
    const messageObjectId = new mongoose.Types.ObjectId(messageid);
    
    console.log('🔍 Converted to ObjectId:', messageObjectId);
    
    const updateResult = await UserModel.updateOne(
      { _id: _user._id },
      { $pull: { messages: { _id: messageObjectId } } }
    );

    console.log('🔍 Update result:', updateResult);

    if (updateResult.modifiedCount === 0) {
      console.log(' Message not found');
      return Response.json(
        { message: 'Message not found or already deleted', success: false },
        { status: 404 }
      );
    }

    console.log(' Message deleted successfully');
    return Response.json(
      { message: 'Message deleted', success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error(' Error deleting message:', error);
    return Response.json(
      { message: 'Error deleting message', success: false },
      { status: 500 }
    );
  }
}