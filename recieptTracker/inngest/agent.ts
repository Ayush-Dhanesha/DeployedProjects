import {
    gemini,
    createNetwork,
    getDefaultRoutingAgent,
}from "@inngest/agent-kit"
import { createServer } from "@inngest/agent-kit/server";
import { Database } from "lucide-react";
import Events from "./constants";
import { inngest } from "@/inngest/client";
import { databaseAgent } from "./agents/DatabaseAgent";
import { recieptScanningAgent } from "./agents/recieptScanningAgent";
import { analyzeReceiptWithAI } from "./agents/aiAnalysisAgent";

const agentNetwork = createNetwork({
    name: "receipt-tracker-agent",
    description: "An agent to process receipts and generate summaries",
    agents: [
        databaseAgent, recieptScanningAgent
    ],
    defaultModel:gemini({
        model: 'gemini-1.5-pro',
        apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
    }),

    defaultRouter : ({network}) =>{
        const saveToDatabase = network.state.kv.get("save-To-Database");
        if(saveToDatabase !== undefined && saveToDatabase === true) {
            return undefined; // Skip routing to the database agent
        }
        return getDefaultRoutingAgent();
    }
});

export const server = createServer({
    agents: [databaseAgent, recieptScanningAgent],
    networks: [agentNetwork],
});

// Export both functions to be registered in the API route
export const extractAndSavePDF = inngest.createFunction(
    {id: "extract-and-save-pdf", name: "Extract and Save PDF"},
    {event : Events.EXTRACT_DATA_FROM_PDF_AND_SAVE_TO_DATABASE},
    async ({event}: { event: any }) => { 
        const result = await agentNetwork.run(
            `Extract the data from this pdf : ${event.data.url} and save it to the database using the recieptId : ${event.data.recieptId} for user: ${event.data.userId}. Apply appropriate plan limitations for free users. Once the data is extracted, save it to the database and terminate the agent process.`,
        )

        return result.state.kv.get("reciept");
    }
);

// Re-export the AI analysis function to ensure it's registered
export { analyzeReceiptWithAI };