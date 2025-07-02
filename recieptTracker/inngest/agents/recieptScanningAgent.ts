import { createAgent, createTool, openai } from "@inngest/agent-kit";
import { anthropic } from "inngest";
import { parse } from "path";
import { z } from "zod";

const parsePdfTool = createTool({
    name:"parse-pdf-tool",
    description: "A tool to parse PDF files and extract structured data from them.",
    parameters:z.object({
        pdfUrl: z.string().describe("The URL of the PDF file to be parsed."),
    }),
    handler: async ({pdfUrl}, {step}) => {
        try {
            return await step?.ai.infer("parse-pdf", {
                model:anthropic({
                    model: 'claude-3-5-sonnet-latest',
                    defaultParameters: {
                        max_tokens: 3094,
                    },
                }),
                body:{
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type:"document",
                                    source:{
                                        type: "url",
                                        url: pdfUrl,
                                    },
                                },
                                {
                                    type: "text",
                                    text:`Extract the data from the reciept and return the extracted data as follows:
                                    {
                                        "recieptId": "Unique identifier for the receipt",
                                        "merchantName": "Store Name",
                                        "merchantAddress": "Store Address",
                                        "merchantPhone": "Store Phone Number",
                                        "transactionDate": "Date of the transaction in timestamp format",
                                        "transactionAmount": "Total amount of the transaction",
                                        "currency": "Currency of the transaction, e.g., 'USD', 'EUR'",
                                        "items": [
                                            {
                                                "name": "Item name",
                                                "quantity": 1,
                                                "unitPrice": 10.00,
                                                "totalPrice": 10.00
                                            }
                                        ],
                                        "recieptSummary": "A summary of the reciept including merchant details, transaction date, and amount.",
                                    },`
                                }
                            ]
                        }
                    ],
                }
            })
        } catch (error) {
            console.error("Error parsing PDF:", error);
            throw new Error("Failed to parse PDF file. Please check the URL and try again.");
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

    model: openai({ 
        model: "gpt-4o-mini",
        defaultParameters: {
            max_completion_tokens: 2000,
        },
    }),

    tools:[parsePdfTool] 
})