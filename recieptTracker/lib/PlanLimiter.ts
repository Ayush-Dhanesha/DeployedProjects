// Usage tracking utility for plan limitations
import { client } from "./Schematic";
import convex from "./ConvexClients";
import { api } from "@/convex/_generated/api";

export interface UsageTracker {
  userId: string;
  feature: string;
  count: number;
  lastReset: Date;
  plan: 'free' | 'pro' | 'enterprise';
}

export class PlanLimiter {
  private static LIMITS = {
    free: {
      'ai-scans': 5,
      'ai-insights': 5,
      'monthly-uploads': 10
    },
    pro: {
      'ai-scans': 100,
      'ai-insights': 100, 
      'monthly-uploads': 1000
    },
    enterprise: {
      'ai-scans': -1, // unlimited
      'ai-insights': -1,
      'monthly-uploads': -1
    }
  };

  static async checkUsageLimit(userId: string, feature: string, plan: 'free' | 'pro' | 'enterprise'): Promise<{
    allowed: boolean;
    current: number;
    limit: number;
    remaining: number;
  }> {
    try {
      // Get the usage limit from our defined limits
      const limit = this.LIMITS[plan][feature as keyof typeof this.LIMITS[typeof plan]] || 0;
      
      // Get the current usage from Convex database
      const usage = await convex.query(api.reciepts.checkAiUsageLimit, { 
        userId, 
        feature 
      });
      
      const current = usage?.currentUsage || 0;
      
      return {
        allowed: limit === -1 || current < limit,
        current,
        limit: limit === -1 ? Infinity : limit,
        remaining: limit === -1 ? Infinity : Math.max(0, limit - current)
      };
    } catch (error) {
      console.error(`Error checking usage limit for user ${userId}, feature ${feature}:`, error);
      
      // Fallback to default values if the database query fails
      const limit = this.LIMITS[plan][feature as keyof typeof this.LIMITS[typeof plan]] || 0;
      return {
        allowed: true, // Allow usage by default in case of errors
        current: 0,
        limit: limit === -1 ? Infinity : limit,
        remaining: limit === -1 ? Infinity : limit
      };
    }
  }

  static async incrementUsage(userId: string, feature: string): Promise<void> {
    try {
      // Update usage in Convex database
      await convex.mutation(api.reciepts.incrementAiUsage, {
        userId,
        feature,
        planType: await this.getUserPlan(userId)
      });
      
      console.log(`Incremented usage for user ${userId}, feature ${feature}`);
    } catch (error) {
      console.error(`Error incrementing usage for user ${userId}, feature ${feature}:`, error);
    }
  }

  static async getUserPlan(userId: string): Promise<'free' | 'pro' | 'enterprise'> {
    // This would typically come from Schematic or your user database
    // For now, return 'free' as default
    try {
      // Example Schematic integration
      // const entitlement = await client.entitlements.checkEntitlement({
      //   lookup: { id: userId },
      //   feature: 'pro-plan'
      // });
      // return entitlement.data?.result ? 'pro' : 'free';
      return 'free';
    } catch (error) {
      console.error('Error checking user plan:', error);
      return 'free';
    }
  }
}

// Feature flags for different plans
export const FEATURES = {
  FREE: {
    aiScans: true,
    aiInsights: true,
    monthlyLimit: 5,
    advancedAnalytics: false,
    prioritySupport: false,
    customCategories: false
  },
  PRO: {
    aiScans: true,
    aiInsights: true,
    monthlyLimit: 100,
    advancedAnalytics: true,
    prioritySupport: true,
    customCategories: true
  },
  ENTERPRISE: {
    aiScans: true,
    aiInsights: true,
    monthlyLimit: -1, // unlimited
    advancedAnalytics: true,
    prioritySupport: true,
    customCategories: true
  }
};
