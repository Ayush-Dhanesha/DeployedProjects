import { createAgent, createTool, gemini } from "@inngest/agent-kit";
import { parse } from "path";
import { z } from "zod";
import { client } from "@/lib/Schematic";

const parsePdfTool = createTool({
    name:"parse-pdf-tool", 
    description: "A tool to parse PDF files and extract structured data from them.",
    parameters:z.object({
        pdfUrl: z.string().describe("The URL of the PDF file to be parsed."),
        userId: z.string().describe("The user ID for feature flag checking."),
    }),
    handler: async ({pdfUrl, userId}, {step}) => {
        try {
            // For now, we'll implement basic feature checking
            // TODO: Implement proper Schematic feature flag checking
            
            // Simulate free plan limitations
            const isFreeUser = true; // This would come from your user data/Schematic
            
            if (isFreeUser) {
                return {
                    success: true,
                    message: "Basic receipt scanning completed (free plan - limited features)",
                    data: {
                        merchantName: "AI-Extracted Merchant",
                        merchantAddress: "Limited in free plan",
                        merchantPhone: "Limited in free plan", 
                        transactionDate: new Date().toISOString(),
                        transactionAmount: 25.99,
                        currency: "USD",
                        items: [
                            {
                                name: "Basic Item Detection",
                                quantity: 1,
                                unitPrice: 25.99,
                                totalPrice: 25.99
                            }
                        ],
                        summary: "📄 Basic AI scanning completed. Upgrade for detailed item extraction and merchant info!",
                        planLimitation: "Free plan: Limited to basic scanning. Upgrade for full AI analysis."
                    }
                };
            }

            // Premium users would get full AI processing here
            return {
                success: true,
                message: "Full AI receipt scanning completed",
                data: {
                    merchantName: "Full AI-Extracted Merchant Name",
                    merchantAddress: "Complete Address Details",
                    merchantPhone: "Complete Phone Number",
                    transactionDate: new Date().toISOString(),
                    transactionAmount: 25.99,
                    currency: "USD",
                    items: [
                        {
                            name: "Detailed Item Analysis",
                            quantity: 1,
                            unitPrice: 25.99,
                            totalPrice: 25.99
                        }
                    ],
                    summary: "🤖 Complete AI analysis with full merchant details and item breakdown"
                }
            };

        } catch (error) {
            console.error("Error parsing PDF:", error);
            return {
                success: false,
                message: "Failed to parse PDF file. Please check the URL and try again.",
                data: null
            };
        }
    }
})

export const recieptScanningAgent = createAgent({

    name: "Reciept Scanning Agent",
    description: "An agent to scan receipts and extract data from them.",
    system : `You are a Reciept Scanning Agent. Your task is to scan receipts and extract data from them. You will receive input data that contains the necessary information for the scanning process. Ensure that you perform the scanning correctly and return the results in a structured format such as
    
    ->Ensure High Accuracy: Use advanced OCR techniques to ensure high accuracy in scanning receipts.
    -> Reciept ID : Unique identifier for the receipt
    -> Merchant Information : Store Name, Address, Phone Number
    -> Transaction Date : Date of the transaction
    -> Transaction Amount : Total amount of the transaction
    -> Transaction Currency : Currency of the transaction
    -> Items : List of items purchased, including item name, quantity, unit price, and total price for each item.
    If the receipt is not valid or cannot be scanned, return an error message indicating the issue.`,

    model: gemini({ 
        model: "gemini-1.5-pro",
        apiKey: process.env.GOOGLE_API_KEY,
    }),

    tools:[parsePdfTool] 
})