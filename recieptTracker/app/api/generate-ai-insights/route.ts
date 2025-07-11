import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { PlanLimiter } from '@/lib/PlanLimiter';

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

    // Increment usage
    await PlanLimiter.incrementUsage(userId, 'ai-insights');

    // Use Gemini to generate AI insights
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Analyze this receipt data and provide intelligent financial insights:

    Receipt Details:
    - Merchant: ${receiptData?.merchantName || 'Unknown'}
    - Amount: $${receiptData?.transactionAmount?.toFixed(2) || '0.00'}
    - Items: ${receiptData?.items?.length || 0} items
    - Item details: ${receiptData?.items?.map((item: any) => `${item.itemName} (qty: ${item.quantity})`).join(', ') || 'Not specified'}

    Please provide:
    1. A brief summary of this purchase
    2. Spending category classification
    3. 4-6 key insights about this transaction
    4. Budget impact assessment
    5. Personalized recommendations

    Format the response as JSON with this structure:
    {
      "summary": "Brief summary text",
      "category": "Spending category",
      "insights": ["insight 1", "insight 2", "insight 3", "insight 4", "insight 5", "insight 6"],
      "budgetImpact": "Impact assessment",
      "recommendations": ["recommendation 1", "recommendation 2"]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let aiInsights;
    try {
      // Try to parse the JSON response from Gemini
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiInsights = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      // Fallback to structured response if JSON parsing fails
      aiInsights = {
        summary: `🤖 AI Analysis for ${receiptData?.merchantName || 'your purchase'} - $${receiptData?.transactionAmount?.toFixed(2) || '0.00'}`,
        category: categorizeSpending(receiptData?.merchantName, receiptData?.transactionAmount),
        insights: [
          `💰 Transaction amount: $${receiptData?.transactionAmount?.toFixed(2) || '0.00'}`,
          `🏪 Merchant: ${receiptData?.merchantName || 'Unknown'}`,
          `📦 Items purchased: ${receiptData?.items?.length || 0} items`,
          `📊 Spending category: ${categorizeSpending(receiptData?.merchantName, receiptData?.transactionAmount)}`,
          `💡 Budget impact: ${getBudgetImpact(receiptData?.transactionAmount)}`,
          `🎯 Recommendation: ${getRecommendation(receiptData)}`
        ],
        budgetImpact: getBudgetImpact(receiptData?.transactionAmount),
        recommendations: [
          "Track similar purchases for better budgeting",
          "Consider setting spending alerts for this category"
        ]
      };
    }

    return NextResponse.json({
      success: true,
      ...aiInsights,
      geminiGenerated: true
    });

  } catch (error) {
    console.error('Error generating AI insights:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate AI insights' },
      { status: 500 }
    );
  }
}

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

function getBudgetImpact(amount?: number): string {
  if (!amount) return "Impact analysis unavailable";
  
  if (amount < 20) return "Low impact - small purchase";
  if (amount < 50) return "Moderate impact - regular expense";
  if (amount < 100) return "Medium impact - consider tracking";
  if (amount < 200) return "High impact - significant expense";
  return "Major impact - review budget carefully";
}

function getRecommendation(receiptData?: any): string {
  const amount = receiptData?.transactionAmount || 0;
  const merchant = receiptData?.merchantName?.toLowerCase() || "";
  
  if (merchant.includes('grocery') && amount > 100) {
    return "Consider meal planning to optimize grocery spending";
  }
  if (merchant.includes('restaurant') && amount > 50) {
    return "Track dining expenses to stay within budget";
  }
  if (amount > 200) {
    return "Large expense - consider if this aligns with your budget goals";
  }
  
  return "Keep tracking expenses for better financial insights";
}
