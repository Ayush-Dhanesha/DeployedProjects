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

export const deleteReciept = mutation({
    args: {
        recieptId: v.id("reciepts"),
    },
    handler: async (ctx, args) => {
        const reciept = await ctx.db.get(args.recieptId);
        if (!reciept) {
            throw new Error("Reciept not found");
        }

        // Try to delete the file from storage, but don't fail if it doesn't exist
        try {
            await ctx.storage.delete(reciept.fileId);
        } catch (error) {
            // Log the error but continue with deletion - the file might already be deleted
            console.warn(`Failed to delete file ${reciept.fileId} from storage:`, error);
        }

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

// AI Usage Tracking Functions

export const getAiUsage = query({
  args: { userId: v.string(), feature: v.string() },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query("aiUsage")
      .withIndex("by_user_feature", (q) => 
        q.eq("userId", args.userId).eq("feature", args.feature)
      )
      .first();
    
    return usage || { usageCount: 0, planType: "free" };
  },
});

export const incrementAiUsage = mutation({
  args: { 
    userId: v.string(), 
    feature: v.string(),
    planType: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("aiUsage")
      .withIndex("by_user_feature", (q) => 
        q.eq("userId", args.userId).eq("feature", args.feature)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        usageCount: existing.usageCount + 1,
        lastUsed: Date.now(),
      });
      return existing.usageCount + 1;
    } else {
      await ctx.db.insert("aiUsage", {
        userId: args.userId,
        feature: args.feature,
        usageCount: 1,
        lastUsed: Date.now(),
        planType: args.planType || "free",
      });
      return 1;
    }
  },
});

export const checkAiUsageLimit = query({
  args: { userId: v.string(), feature: v.string() },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query("aiUsage")
      .withIndex("by_user_feature", (q) => 
        q.eq("userId", args.userId).eq("feature", args.feature)
      )
      .first();

    const currentUsage = usage?.usageCount || 0;
    const planType = usage?.planType || "free";
    
    // Define limits per plan
    const limits = {
      free: {
        receipt_summary: 3,
        receipt_scan: 3,
      },
      premium: {
        receipt_summary: -1, // unlimited
        receipt_scan: -1, // unlimited
      }
    };

    const limit = limits[planType as keyof typeof limits]?.[args.feature as keyof typeof limits.free] || 0;
    const hasAccess = planType === "premium" || currentUsage < limit;
    const remaining = planType === "premium" ? -1 : Math.max(0, limit - currentUsage);

    return {
      hasAccess,
      currentUsage,
      limit,
      remaining,
      planType,
    };
  },
});


