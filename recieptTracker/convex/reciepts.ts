import { v } from "convex/values";
import {query, mutation} from "./_generated/server";

export const generateUploadUrl = mutation({
    args: {},
    handler : async(ctx) => {
        
        return await ctx.storage.generateUploadUrl();
    },
});

export const storeReciept = mutation({
    args: {
        userId : v.string(),
        fileName :v.string(),
        fileId :v.id("_storage"),
        uploadedAt: v.number(),
        size : v.number(),
        mimType : v.string()
    },
    handler: async (ctx, args) => {
        const recieptId = await ctx.db.insert("reciepts", {
            userId: args.userId,
            fileName: args.fileName,
            fileId: args.fileId,
            uploadedAt: Date.now(), // Use current timestamp for uploadedAt
            size: args.size,
            mimeType: args.mimType,
            status: "processing", 
            // Initial status
            merchantName: undefined, // Initialize with an empty string
            merchantAddress: undefined, // Initialize with an empty string
            merchantPhone: undefined, // Initialize with an empty string
            merchantEmail: undefined, // Initialize with an empty string
            transactionDate: undefined, // Initialize with undefined (timestamp)
            transactionAmount: undefined, // Initialize with undefined
            transactionCurrency: undefined, // Initialize with an empty string 
            items: [], // Initialize with an empty array
        });
        return recieptId;
    }
});

export const getReciepts = query({
    args: {
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.query("reciepts").filter((q) => q.eq(q.field("userId"), args.userId)).order("desc").collect();
    }
});

export const getRecieptById = query({
    args: {
        recieptId: v.id("reciepts"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.recieptId);
    }
    
    
});

export const getrecieptDownloadUrl = query({
    args: {
        fileId: v.id("_storage"),
    },
    handler: async (ctx, args) => {
        
        return await ctx.storage.getUrl(args.fileId);
    }   
});

export const updateReciept = mutation({
    args: {
        recieptId: v.id("reciepts"),
        status: v.optional(v.string()), // e.g., "processing", "completed", "failed"
    },
    handler: async (ctx, args) => {
        const reciept = await ctx.db.get(args.recieptId);
        if (!reciept) {
            throw new Error("Reciept not found");
        }

        const updatedReciept = {
            ...reciept,
            status: args.status ?? reciept.status, // Update status if provided
            // You can add more fields to update here if needed
        };

        await ctx.db.replace(args.recieptId, updatedReciept);
        return updatedReciept;
    }
});

const deleteReciept = mutation({
    args: {
        recieptId: v.id("reciepts"),
    },
    handler: async (ctx, args) => {
        const reciept = await ctx.db.get(args.recieptId);
        if (!reciept) {
            throw new Error("Reciept not found");
        }

        // Delete the file from storage
        await ctx.storage.delete(reciept.fileId);

        // Delete the reciept from the database
        await ctx.db.delete(args.recieptId);
        
        return { success: true };
    }
});

export const updateRecieptwithExtractedData = mutation({
    args: {
        recieptId: v.id("reciepts"),
        merchantName: v.optional(v.string()),
        merchantAddress: v.optional(v.string()),
        merchantPhone: v.optional(v.string()),
        merchantEmail: v.optional(v.string()),
        transactionDate: v.optional(v.number()), // Timestamp of the transaction
        transactionAmount: v.optional(v.number()), // Amount of the transaction
        transactionCurrency: v.optional(v.string()), // Currency of the transaction, e.g., "USD", "EUR"
        items: v.array(v.object({
            itemName: v.string(),
            quantity: v.number(),
            unitPrice: v.optional(v.number()), // e.g., "Food", "Transport", "Utilities"
            totalprices: v.optional(v.number()), // Timestamp of the item
        })),
    },
    handler: async (ctx, args) => {
        const reciept = await ctx.db.get(args.recieptId);
        if (!reciept) {
            throw new Error("Reciept not found");
        }

        const updatedReciept = {
            ...reciept,
            merchantName: args.merchantName ?? reciept.merchantName,
            merchantAddress: args.merchantAddress ?? reciept.merchantAddress,
            merchantPhone: args.merchantPhone ?? reciept.merchantPhone,
            merchantEmail: args.merchantEmail ?? reciept.merchantEmail,
            transactionDate: args.transactionDate ?? reciept.transactionDate,
            transactionAmount: args.transactionAmount ?? reciept.transactionAmount,
            transactionCurrency: args.transactionCurrency ?? reciept.transactionCurrency,
            items: args.items.length > 0 ? args.items : reciept.items, // Update items if provided
            status: "completed", // Update status to completed after extracting data
        };

        await ctx.db.replace(args.recieptId, updatedReciept);
        return updatedReciept;
    }
});


