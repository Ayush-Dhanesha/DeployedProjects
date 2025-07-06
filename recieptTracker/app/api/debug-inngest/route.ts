import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Log all environment variables related to Inngest
    console.log({
      INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY ? "Set" : "Not set",
      INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY ? "Set" : "Not set",
      NEXT_PUBLIC_INNGEST_BASE_URL: process.env.NEXT_PUBLIC_INNGEST_BASE_URL ? "Set" : "Not set",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "Set" : "Not set",
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? "Set" : "Not set",
      NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL ? "Set" : "Not set"
    });

    // Get the body of the request
    const body = await request.json();
    console.log("Received request body:", JSON.stringify(body, null, 2));

    // Test direct call to inngest
    try {
      const inngestResponse = await fetch('/api/inngest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      const inngestData = await inngestResponse.text();
      
      return NextResponse.json({
        status: "Debug information logged",
        inngestStatus: inngestResponse.status,
        inngestStatusText: inngestResponse.statusText,
        inngestData: inngestData
      });
    } catch (inngestError) {
      console.error("Error calling inngest API:", inngestError);
      return NextResponse.json({
        status: "Error calling inngest API",
        error: inngestError instanceof Error ? inngestError.message : String(inngestError)
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json({ 
      status: "Error", 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
