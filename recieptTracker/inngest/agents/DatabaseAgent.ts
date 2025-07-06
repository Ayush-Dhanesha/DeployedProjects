import { createAgent, createTool, gemini } from "@inngest/agent-kit";
import {z} from "zod";
import { Context } from "inngest";
import convex  from "@/lib/ConvexClients";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {client} from "@/lib/Schematic"


const saveToDatabaseTool =  createTool({
    name: "Save to Database Tool",
    description: "A tool to save data to the convex database.",
    parameters: z.object({
            fileDisplayName: z.string().describe("The readable display name of the reciept to be saved.If the file name is not human readable , use this to give a human readable name to the file."

            ),  
            recieptId: z.string().describe("The ID of the reciept to be updated in the database."

            ),
            merchantName: z.string().describe("The name of the merchant from which the reciept was generated."
            ),
            merchantAddress: z.string().describe("The address of the merchant from which the reciept was generated."
            ),  
            merchantPhone: z.string().describe("The contact information of the merchant from which the reciept was generated."
            ),
            transactionDate: z.string().describe("The date of the transaction in timestamp format."
            ),  
            transactionAmount: z.string().describe("The amount of the transaction,Summing up all the items in the reciept."
            ),
            recieptSummary: z.string().describe("A summary of the reciept, including the merchant name, address, contact information, transaction date, and amount. Include a human readable summary of the reciept. Mention both reciept and invoice number if available. Include some key details about the reciept such as the items purchased, their prices, and any discounts applied."
            ),
            currency : z.string().describe("The currency of the transaction, e.g., 'USD', 'EUR'."
            ),
            items: z.array(z.object({
                name: z.string().describe("The name of the item purchased."
                ),
                quantity: z.number().describe("The quantity of the item purchased."
                ),
                unitPrice: z.number().describe("The price per unit of the item purchased."
                ),
                totalPrice: z.number().describe("The total price of the item purchased, calculated as quantity * unitPrice."
                ),
            })).describe("An array of items purchased in the transaction, each with name, quantity, unitPrice, and totalPrice."
            ),

    }),
    handler : async (params,Context )  => {
        const { fileDisplayName, recieptId, merchantName, merchantAddress, merchantPhone, transactionDate, transactionAmount, recieptSummary, currency, items } = params;
 
    const result = await Context.step?.run( 
         "Save-Reciept-to-Database",
        async () => {
            try {

                const {userId} = await convex.mutation(
                    api.reciepts.updateRecieptwithExtractedData,
                    {
                        recieptId: recieptId as Id<"reciepts">,
                        merchantName,
                        merchantAddress,
                        merchantPhone,
                        transactionDate: Number(transactionDate),
                        transactionAmount: Number(transactionAmount),
                        transactionCurrency: currency,
                        items: items.map(item => ({
                            itemName: item.name,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalprices: item.totalPrice,
                        })),
                    },
                );
                await client.track({
                    event: "scaning-reciept",
                    company:{
                        id: userId,
                    },
                    user: {
                        id: userId,
                    },
                });

                return {
                    addedToDB: "Success",
                    recieptId,
                    fileDisplayName,
                    merchantName,
                    merchantAddress,
                    merchantPhone,
                    transactionDate: Number(transactionDate),
                    transactionAmount: Number(transactionAmount),
                    transactionCurrency: currency,
                    recieptSummary,
                    items,
                };


            }catch(error){
                return {
                    addedToDB: false,
                    error: `Failed to save reciept to database: ${error instanceof Error ? error.message : String(error)}`,
                };

            }
        }
    )

    if(result?.addedToDB === "Success") {
        Context.network?.state.kv.set("save-to-database", true);
        Context.network?.state.kv.set("reciept", recieptId);
    }

    return result;
},

});

export const databaseAgent = createAgent({
    name: "Database Agent",
    description: "An agent to handle database operations and CRUD tasks in convex database.",
    system :`You are a Database Agent. Your task is to handle database operations and CRUD tasks in the convex database. You will receive input data that contains the necessary information for the operations. Ensure that you perform the operations correctly and return the results in a structured format.`,
    model : gemini({
        model: 'gemini-1.5-pro',
        apiKey: process.env.GOOGLE_API_KEY,
    }),
    tools: [saveToDatabaseTool],

});