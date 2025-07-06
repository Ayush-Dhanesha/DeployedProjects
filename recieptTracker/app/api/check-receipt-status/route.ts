import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    // Get receipt ID from query parameters
    const searchParams = request.nextUrl.searchParams;
    const receiptId = searchParams.get('id');
    
    if (!receiptId) {
      return NextResponse.json({ error: 'Receipt ID is required' }, { status: 400 });
    }
    
    // Get receipt status from Convex
    const receipt = await convex.query(api.reciepts.getRecieptById, { 
      recieptId: receiptId as unknown as Id<"reciepts">
    });
    
    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      status: receipt.status || 'processing',
      id: receiptId
    });
  } catch (error) {
    console.error('Error checking receipt status:', error);
    return NextResponse.json({ error: 'Failed to check receipt status' }, { status: 500 });
  }
}
