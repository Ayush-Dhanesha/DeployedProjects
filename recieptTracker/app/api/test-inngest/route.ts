import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/inngest/client';

export async function POST(request: NextRequest) {
  try {
    console.log("Inngest test endpoint called");
    
    // Parse request body
    const body = await request.json();
    console.log("Request body:", body);
    
    // Basic validation
    if (!body.name || !body.data) {
      return NextResponse.json({ error: 'Missing required fields (name, data)' }, { status: 400 });
    }

    // Send event to Inngest directly using the client
    try {
      const result = await inngest.send({
        name: body.name,
        data: body.data
      });
      
      console.log("Inngest event sent successfully:", result);
      return NextResponse.json({ success: true, result });
    } catch (inngestError) {
      console.error("Error sending Inngest event:", inngestError);
      return NextResponse.json({ 
        error: 'Error sending Inngest event',
        details: inngestError instanceof Error ? inngestError.message : String(inngestError) 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
