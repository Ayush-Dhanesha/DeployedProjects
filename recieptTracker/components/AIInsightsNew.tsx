'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { Sparkles, Lock, AlertCircle, CheckCircle, Zap } from 'lucide-react';

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
  const [summary, setSummary] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Check AI usage limits
  const usageData = useQuery(api.reciepts.checkAiUsageLimit, 
    user ? { 
      userId: user.id, 
      feature: "receipt_summary" 
    } : "skip"
  );

  const incrementUsage = useMutation(api.reciepts.incrementAiUsage);

  const generateSummary = async () => {
    if (!user || !usageData?.hasAccess) return;

    setIsGenerating(true);
    setError('');

    try {
      // Increment usage count
      await incrementUsage({
        userId: user.id,
        feature: "receipt_summary",
        planType: usageData.planType
      });

      // Simulate AI summary generation (replace with actual AI call)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockSummary = `🛍️ **Smart Receipt Analysis**

**Transaction Overview:**
• Merchant: ${receiptData?.merchantName || 'Unknown Store'}
• Total: $${receiptData?.transactionAmount?.toFixed(2) || '0.00'}
• Items: ${receiptData?.items?.length || 0} products

**AI Insights:**
• This appears to be a ${getTransactionCategory(receiptData)} purchase
• Spending pattern: ${getSpendingPattern(receiptData?.transactionAmount)}
• Budget impact: ${getBudgetImpact(receiptData?.transactionAmount)}

**Smart Recommendations:**
• Consider price comparison for similar items
• Track this category for monthly budget analysis
• Save receipt for tax purposes if business-related

${usageData.planType === 'free' ? `\n🔓 **Free Trial**: ${usageData.remaining - 1} uses remaining` : ''}`;

      setSummary(mockSummary);
    } catch (err) {
      setError('Failed to generate AI summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getTransactionCategory = (data: any) => {
    const amount = data?.transactionAmount || 0;
    if (amount < 20) return 'convenience store';
    if (amount < 100) return 'retail';
    if (amount < 500) return 'major purchase';
    return 'significant expense';
  };

  const getSpendingPattern = (amount?: number) => {
    if (!amount) return 'minimal';
    if (amount < 50) return 'routine spending';
    if (amount < 200) return 'moderate expense';
    return 'high-value purchase';
  };

  const getBudgetImpact = (amount?: number) => {
    if (!amount) return 'no impact';
    if (amount < 25) return 'low impact';
    if (amount < 100) return 'moderate impact';
    return 'significant impact';
  };

  if (!user) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">AI Receipt Summary</h3>
        </div>
        <div className="text-gray-600">
          Please sign in to access AI-powered receipt analysis.
        </div>
      </div>
    );
  }

  if (!usageData) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-blue-500 animate-spin" />
          <h3 className="text-lg font-semibold">AI Receipt Summary</h3>
        </div>
        <div className="text-gray-600">Loading AI capabilities...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">AI Receipt Summary</h3>
        </div>
        
        {usageData.planType === 'free' && (
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
            {usageData.remaining} trials left
          </div>
        )}
      </div>

      {!usageData.hasAccess ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <Lock className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-amber-800 mb-1">
                Summary Feature Locked
              </div>
              <div className="text-amber-700 text-sm mb-3">
                You've used all {usageData.limit} free AI summary trials. Upgrade your plan to access unlimited AI-powered receipt summaries and insights.
              </div>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm"
                onClick={() => window.open('/manage-plan', '_blank')}
              >
                <Zap className="h-4 w-4 mr-2" />
                Upgrade Plan Here
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {!summary && !isGenerating && (
            <div className="text-center space-y-3">
              <div className="text-gray-600 text-sm">
                Get AI-powered insights about your receipt including spending patterns, 
                category analysis, and smart recommendations.
              </div>
              <Button 
                onClick={generateSummary}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                disabled={isGenerating}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Try Free AI Summary
                {usageData.planType === 'free' && ` (${usageData.remaining} of 5 free)`}
              </Button>
            </div>
          )}

          {isGenerating && (
            <div className="text-center space-y-3 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <div className="text-gray-600">
                AI is analyzing your receipt...
              </div>
            </div>
          )}

          {summary && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Analysis Complete</span>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200 whitespace-pre-line text-sm">
                {summary}
              </div>
              {usageData.hasAccess && (
                <Button 
                  onClick={generateSummary}
                  variant="outline"
                  size="sm"
                  disabled={isGenerating}
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Regenerate Summary
                  {usageData.planType === 'free' && ` (${usageData.remaining - 1} left)`}
                </Button>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          )}
        </div>
      )}

      {usageData.planType === 'free' && usageData.hasAccess && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-xs text-blue-700">
            <strong>Free Trial:</strong> Enjoying AI summaries? Upgrade for unlimited access, 
            advanced analytics, and premium insights.
            <button 
              onClick={() => window.open('/manage-plan', '_blank')}
              className="ml-2 underline hover:no-underline"
            >
              Upgrade Plan Here
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
