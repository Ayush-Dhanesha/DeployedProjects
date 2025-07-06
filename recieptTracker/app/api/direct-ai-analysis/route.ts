import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PlanLimiter } from '@/lib/PlanLimiter';

// Initialize clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { receiptId, receiptData, userId } = await request.json();

    if (!receiptId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check usage limits
    const plan = await PlanLimiter.getUserPlan(userId);
    const usageCheck = await PlanLimiter.checkUsageLimit(userId, 'ai-insights', plan);
    
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { error: 'Usage limit exceeded', usageCheck },
        { status: 403 }
      );
    }

    // Update status to processing
    try {
      await convex.mutation(api.reciepts.updateReciept, {
        recieptId: receiptId as Id<"reciepts">,
        status: "processing"
      });
    } catch (error) {
      console.error('Error updating receipt status to processing:', error);
    }

    // Increment usage
    await PlanLimiter.incrementUsage(userId, 'ai-insights');

    // Prepare the prompt for Gemini
    const merchantName = receiptData?.merchantName || "Unknown";
    const amount = receiptData?.transactionAmount || 0;
    const items = receiptData?.items || [];
    
    const itemsList = items.length > 0 
      ? items.map((item: any) => `- ${item.itemName} (Qty: ${item.quantity}, Price: $${item.unitPrice || 'N/A'})`).join('\n')
      : "No detailed items available";

    const prompt = `Analyze this receipt and provide smart financial insights:

    Merchant: ${merchantName}
    Total Amount: $${amount.toFixed(2)}
    Items:
    ${itemsList}

    Please provide:
    1. A brief summary of the purchase
    2. Spending category classification
    3. Budget impact assessment
    4. 3-5 key insights about this purchase
    5. Practical recommendations for better financial management

    Format your response as a JSON object with the following structure:
    {
      "summary": "Brief summary of the purchase",
      "category": "Spending category",
      "budgetImpact": "Impact assessment",
      "insights": ["insight1", "insight2", "insight3", "insight4", "insight5"],
      "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
    }`;

    // Process items from receipt data for enhanced insights
    let enhancedItems = [];
    if (receiptData?.items && receiptData.items.length > 0) {
      enhancedItems = receiptData.items.map((item: any) => ({
        name: item.itemName,
        quantity: item.quantity,
        price: item.unitPrice,
        category: categorizeItem(item.itemName)
      }));
    }

    let aiInsights;
    try {
      // Call Gemini API
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON from the response
      try {
        // Clean the response text to extract JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiInsights = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError);
        // Create fallback response
        aiInsights = {
          summary: `Analysis for ${receiptData?.merchantName || 'your purchase'}`,
          category: categorizeSpending(receiptData?.merchantName, receiptData?.transactionAmount),
          budgetImpact: getBudgetImpact(receiptData?.transactionAmount),
          insights: [
            `💰 Amount: $${receiptData?.transactionAmount?.toFixed(2) || '0.00'}`,
            `🏪 Merchant: ${receiptData?.merchantName || 'Unknown'}`,
            `📦 Items: ${receiptData?.items?.length || 0}`,
            "📊 Basic analysis completed",
            "⚠️ Enhanced AI features temporarily unavailable"
          ],
          recommendations: [
            "Continue tracking your expenses",
            "Review your spending patterns",
            "Set budget goals for better control"
          ]
        };
      }

      // Update receipt status to completed
      try {
        await convex.mutation(api.reciepts.updateReciept, {
          recieptId: receiptId as Id<"reciepts">,
          status: "completed"
        });
        console.log(`Successfully updated receipt ${receiptId} status to completed`);
      } catch (error) {
        console.error(`Failed to update receipt status: ${error}`);
      }

      // Return the final response
      return NextResponse.json({
        ...aiInsights,
        items: enhancedItems,
        analysisType: "gemini-ai",
        status: "completed", // Matching the database status
        timestamp: new Date().toISOString(),
        receiptId,
        userId
      });
    } catch (error) {
      console.error("AI analysis error:", error);

      // Still update receipt status to completed even in fallback case
      try {
        await convex.mutation(api.reciepts.updateReciept, {
          recieptId: receiptId as Id<"reciepts">,
          status: "completed" // Still mark as completed even with fallback
        });
        console.log(`Successfully updated receipt ${receiptId} status to completed (fallback)`);
      } catch (updateError) {
        console.error(`Failed to update receipt status in fallback: ${updateError}`);
      }
      
      // Return fallback analysis
      return NextResponse.json({
        summary: `Analysis for ${receiptData?.merchantName || 'your purchase'}`,
        category: "General",
        insights: [
          `💰 Amount: $${receiptData?.transactionAmount?.toFixed(2) || '0.00'}`,
          `🏪 Merchant: ${receiptData?.merchantName || 'Unknown'}`,
          `📦 Items: ${receiptData?.items?.length || 0}`,
          "📊 Basic analysis completed",
          "⚠️ Enhanced AI features temporarily unavailable"
        ],
        recommendations: [
          "Continue tracking your expenses",
          "Review your spending patterns",
          "Set budget goals for better control"
        ],
        items: enhancedItems,
        status: "completed", // Matching database status - mark as completed
        analysisType: "fallback",
        timestamp: new Date().toISOString(),
        receiptId,
        userId,
        error: "AI service temporarily unavailable"
      });
    }
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Failed to analyze receipt" },
      { status: 500 }
    );
  }
}

// Helper functions
function categorizeSpending(merchantName?: string, amount?: number): string {
  if (!merchantName) return "General";
  
  const merchant = merchantName.toLowerCase();
  
  if (merchant.includes('grocery') || merchant.includes('market') || merchant.includes('food')) {
    return "Groceries & Food";
  }
  if (merchant.includes('gas') || merchant.includes('fuel') || merchant.includes('shell') || merchant.includes('bp')) {
    return "Transportation";
  }
  if (merchant.includes('restaurant') || merchant.includes('cafe') || merchant.includes('pizza')) {
    return "Dining Out";
  }
  if (merchant.includes('amazon') || merchant.includes('target') || merchant.includes('walmart')) {
    return "Retail & Shopping";
  }
  if (merchant.includes('pharmacy') || merchant.includes('cvs') || merchant.includes('walgreens')) {
    return "Health & Pharmacy";
  }
  
  return "General";
}

// Categorize individual receipt items
function categorizeItem(itemName?: string): string {
  if (!itemName) return "Other";
  
  const item = itemName.toLowerCase();
  
  // Food categories
  if (item.includes('milk') || item.includes('cheese') || item.includes('yogurt')) {
    return "Dairy";
  }
  if (item.includes('bread') || item.includes('bagel') || item.includes('roll') || item.includes('muffin')) {
    return "Bakery";
  }
  if (item.includes('meat') || item.includes('chicken') || item.includes('beef') || item.includes('pork') || item.includes('fish')) {
    return "Meat & Seafood";
  }
  if (item.includes('fruit') || item.includes('vegetable') || item.includes('produce') || item.includes('apple') || 
      item.includes('banana') || item.includes('onion') || item.includes('potato')) {
    return "Produce";
  }
  
  // Non-food categories
  if (item.includes('medicine') || item.includes('vitamin') || item.includes('pill') || item.includes('medication')) {
    return "Healthcare";
  }
  if (item.includes('paper') || item.includes('soap') || item.includes('clean') || item.includes('detergent')) {
    return "Household";
  }
  if (item.includes('toy') || item.includes('game') || item.includes('book')) {
    return "Entertainment";
  }
  if (item.includes('shirt') || item.includes('pant') || item.includes('shoe') || item.includes('cloth')) {
    return "Clothing";
  }
  
  return "Other";
}

function getBudgetImpact(amount?: number): string {
  if (!amount) return "Impact analysis unavailable";
  
  if (amount < 20) return "Low impact";
  if (amount < 50) return "Moderate impact";
  if (amount < 100) return "Medium impact";
  if (amount < 200) return "High impact";
  return "Major impact";
}
