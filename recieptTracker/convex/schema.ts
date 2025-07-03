import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  reciepts: defineTable({
    userId : v.string(),
    fileName :v.string(),
    fileDisplayName : v.optional(v.string()),
    fileId :v.id("_storage"),
    uploadedAt: v.number(),
    size : v.number(),
    status: v.optional(v.string()), // e.g., "processing", "completed", "failed"
    mimeType : v.string(), // e.g., "application/pdf"

    merchantName: v.optional(v.string()), // Name of the merchant
    merchantAddress: v.optional(v.string()), // Address of the merchant
    merchantPhone: v.optional(v.string()), // Phone number of the merchant
    merchantEmail: v.optional(v.string()), // Email of the merchant
    transactionDate: v.optional(v.number()), // Timestamp of the transaction
    transactionAmount: v.optional(v.number()), // Amount of the transaction
    transactionCurrency: v.optional(v.string()), // Currency of the transaction, e.g., "USD", "EUR"
    recieptSummary: v.optional(v.string()), // Human-readable summary of the reciept
    // Array of items in the receipt


   items : v.array(v.object({
      itemName: v.string(),
      quantity: v.number(),
      unitPrice: v.optional(v.number()), // e.g., "Food", "Transport", "Utilities"
      totalprices: v.optional(v.number()), // Timestamp of the item
   }),
  ),
  }),
});
