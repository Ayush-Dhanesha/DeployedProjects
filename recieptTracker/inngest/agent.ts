import {
    anthropic,
    createNetwork,
    getDefaultRoutingAgent,
}from "@inngest/agent-kit"
import { createServer } from "@inngest/agent-kit/server";
import { Database } from "lucide-react";
import Events from "./constants";
import { inngest } from "@/inngest/client";
import { databaseAgent } from "./agents/DatabaseAgent";
import { recieptScanningAgent } from "./agents/recieptScanningAgent";


const agentNetwork = createNetwork({
    name: "receipt-tracker-agent",
    description: "An agent to process receipts and generate summaries",
    agents: [
        databaseAgent, recieptScanningAgent
    ],
    defaultModel:anthropic({
        model: 'claude-3-5-sonnet-latest',
        defaultParameters: {
            max_tokens: 2000,
        },
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


export const extractAndSavePDF = inngest.createFunction(
    {id: "extract-and-save-pdf", name: "Extract and Save PDF"},
    {event : Events.EXTRACT_DATA_FROM_PDF_AND_SAVE_TO_DATABASE},
    async ({event}: { event: any }) => { 
        const result = await agentNetwork.run(
            `Extract the data from this pdf : ${event.data.Url} and save it to the database using the recieptId : ${event.data.recieptId}. once the data is extracted, save it to the database and terminate the agent proccess.`,
        )

        return result.state.kv.get("reciept");
    }
);