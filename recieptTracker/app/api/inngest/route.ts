import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { extractAndSavePDF } from "@/inngest/agent";
import { analyzeReceiptWithAI } from "@/inngest/agents/aiAnalysisAgent";

// Create an API that serves functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    extractAndSavePDF,
    analyzeReceiptWithAI  // Register the AI analysis function
  ],
});
