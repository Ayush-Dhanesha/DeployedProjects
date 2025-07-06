'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { Sparkles, Lock, AlertCircle, CheckCircle, Zap, TrendingUp, Calendar, DollarSign, Gift } from 'lucide-react';

interface AIInsightsProps {
  receiptId: string;
  receiptData?: {
    merchantName?: string;
    transactionAmount?: number;
    items?: Array<{
      itemName: string;
      quantity: number;
      unitPrice?: number;
    }>;
  };
}

export default function AIInsights({ receiptId, receiptData }: AIInsightsProps) {
  const { user } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [triesRemaining, setTriesRemaining] = useState(3); // Free trial tries
  const [hasUsedTrial, setHasUsedTrial] = useState(false);
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Get user's trial status from local storage
  useEffect(() => {
    if (user) {
      const trialData = localStorage.getItem(`aiInsightsTrial_${user.id}`);
      if (trialData) {
        const { used, remaining } = JSON.parse(trialData);
        setHasUsedTrial(used > 0);
        setTriesRemaining(remaining);
      }
    }
    
    // Clear any interval on unmount
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [user]);

  const updateTrialUsage = () => {
    if (user && triesRemaining > 0) {
      const newRemaining = triesRemaining - 1;
      localStorage.setItem(`aiInsightsTrial_${user.id}`, JSON.stringify({
        used: hasUsedTrial ? 3 - newRemaining : 1,
        remaining: newRemaining
      }));
      setTriesRemaining(newRemaining);
      setHasUsedTrial(true);
    }
  };

  const generateAIInsights = async () => {
    if (triesRemaining <= 0) return;
    
    setIsGenerating(true);
    updateTrialUsage();
    
    try {
      // Show initial "processing" state
      setInsights({
        summary: "Processing your receipt...",
        category: "Analysis in progress",
        insights: [
          "AI is analyzing your receipt data",
          "This typically takes 5-10 seconds",
          "Please wait while we process your information"
        ],
        recommendations: [
          "Results will appear shortly"
        ],
        status: "processing",
        trialMessage: `You have ${triesRemaining} free AI analysis${triesRemaining !== 1 ? 'es' : ''} remaining!`
      });
      
      // Try using direct API first (bypassing Inngest) - this should be more reliable
      try {
        const aiResponse = await fetch('/api/direct-ai-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            receiptId,
            receiptData,
            userId: user?.id
          })
        });
        
        if (aiResponse.ok) {
          const aiInsights = await aiResponse.json();
          setInsights({
            ...aiInsights,
            status: "completed",
            trialMessage: `You have ${triesRemaining} free AI analysis${triesRemaining !== 1 ? 'es' : ''} remaining!`
          });
          setIsGenerating(false);
          return;
        }
      } catch (directApiError) {
        console.error("Error using direct AI analysis:", directApiError);
        // Continue to fallback approaches if direct API fails
      }
      
      // Fallback: Try the original Inngest approach
      try {
        // Trigger the Inngest function via event
        await fetch('/api/inngest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'ai/analyze-receipt',
            data: {
              receiptId,
              receiptData,
              userId: user?.id
            }
          })
        });
      } catch (inngestError) {
        console.error("Error triggering Inngest:", inngestError);
        // Continue even if Inngest call fails - we'll get results from the API
      }

      // Wait for 5 seconds to give the function time to start processing
      setTimeout(async () => {
        try {
          // Get the insights from the API
          const aiInsightsResponse = await fetch('/api/generate-ai-insights', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              receiptId,
              receiptData,
              userId: user?.id
            })
          });
          
          if (aiInsightsResponse.ok) {
            const aiInsights = await aiInsightsResponse.json();
            setInsights({
              ...aiInsights,
              status: "completed",
              trialMessage: `You have ${triesRemaining} free AI analysis${triesRemaining !== 1 ? 'es' : ''} remaining!`
            });
          } else {
            throw new Error(`API returned ${aiInsightsResponse.status}`);
          }
        } catch (error) {
          console.error("Error getting AI insights:", error);
          setInsights({
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
            status: "completed",
            trialMessage: `You have ${triesRemaining} free AI analysis${triesRemaining !== 1 ? 'es' : ''} remaining!`
          });
        }
        
        setIsGenerating(false);
      }, 5000);
      
    } catch (error) {
      console.error("Error generating AI insights:", error);
      setInsights({
        summary: "Error generating insights",
        category: "Error",
        insights: ["There was an error processing your receipt", "Please try again later"],
        recommendations: ["Try again in a few moments"],
        status: "error",
        trialMessage: `You have ${triesRemaining} free AI analysis${triesRemaining !== 1 ? 'es' : ''} remaining!`
      });
      setIsGenerating(false);
    }
  };

  if (!user) {
    return (
      <div className="rounded-lg bg-gray-50 p-4 text-center space-y-3">
        <p className="text-sm text-gray-500">Please sign in to access AI insights</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.href = 'https://wise-whale-35.accounts.dev/sign-in?redirect_url=' + encodeURIComponent(window.location.href)}
        >
          Sign In
        </Button>
      </div>
    );
  }

  if (insights) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Insights
          </h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setInsights(null)}
            className="text-xs"
          >
            Reset
          </Button>
        </div>

        {insights.status === "processing" ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <p className="text-sm text-gray-500">Analyzing your receipt data...</p>
          </div>
        ) : (
          <>
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h3 className="font-medium">{insights.summary}</h3>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                  {insights.category}
                </span>
                {insights.budgetImpact && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {insights.budgetImpact}
                  </span>
                )}
              </div>
              
              <h4 className="font-medium text-sm flex items-center gap-1 mt-4">
                <Zap className="h-4 w-4 text-amber-500" />
                Key Insights
              </h4>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {insights.insights.map((insight: string, i: number) => (
                  <li key={i} className="text-sm">{insight}</li>
                ))}
              </ul>
              
              <h4 className="font-medium text-sm flex items-center gap-1 mt-4">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Recommendations
              </h4>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {insights.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="text-sm">{rec}</li>
                ))}
              </ul>
              
              {insights.trialMessage && (
                <div className="text-xs text-gray-500 mt-4 border-t pt-2">
                  {insights.trialMessage}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-500" />
        AI Insights
      </h2>
      
      {triesRemaining > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="font-medium mb-2">Get AI-powered analysis of your receipt</h3>
          <p className="text-sm text-gray-600 mb-4">
            Our AI can help you understand your spending patterns, categorize expenses, 
            and provide personalized financial recommendations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="border rounded p-3 text-center">
              <Calendar className="h-5 w-5 mx-auto mb-2 text-blue-500" />
              <p className="text-sm">Spending Trends</p>
            </div>
            <div className="border rounded p-3 text-center">
              <DollarSign className="h-5 w-5 mx-auto mb-2 text-green-500" />
              <p className="text-sm">Budget Impact</p>
            </div>
            <div className="border rounded p-3 text-center">
              <Gift className="h-5 w-5 mx-auto mb-2 text-purple-500" />
              <p className="text-sm">Smart Suggestions</p>
            </div>
          </div>
          
          <Button
            className="w-full"
            onClick={generateAIInsights}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate AI Insights"}
            <Sparkles className="h-4 w-4 ml-2" />
          </Button>
          
          <p className="text-xs text-gray-500 mt-3">
            You have {triesRemaining} free AI analysis{triesRemaining !== 1 ? 'es' : ''} remaining.
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 border rounded-lg p-5">
          <div className="flex flex-col items-center mb-4">
            <Lock className="h-10 w-10 text-gray-400 mb-2" />
            <h3 className="font-medium">Upgrade to unlock AI insights</h3>
            <p className="text-sm text-gray-600 text-center">
              You've used all your free analyses. Upgrade to continue getting AI-powered insights.
            </p>
          </div>
          
          <Button className="w-full" onClick={() => window.location.href = '/manage-plan'}>
            Upgrade Plan
          </Button>
        </div>
      )}
      
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <AlertCircle className="h-4 w-4" />
        <p>Insights are generated using AI and should be reviewed for accuracy.</p>
      </div>
    </div>
  );
}
