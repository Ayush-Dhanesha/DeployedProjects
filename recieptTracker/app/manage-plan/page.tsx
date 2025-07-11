'use client';

import React, { useState, useEffect, useMemo } from 'react'
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { getTemporaryAccessToken } from '@/actions/getTemporaryaccessToken';
import { TokenCacheManager } from '@/lib/tokenCache';
import SchematicEmbed from '@/components/schematic/SchematicEmbed';
import PlanLimitationBanner from '@/components/PlanLimitationBanner';
import { Sparkles, FileText, BarChart3, Shield, Loader2 } from 'lucide-react';

function ManagePlan() {
  const { user } = useUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  
  // Get usage data for different features - only fetch if user exists
  const aiInsightsUsage = useQuery(api.reciepts.checkAiUsageLimit, 
    user ? { userId: user.id, feature: "ai-insights" } : "skip"
  );
  
  const receiptScanUsage = useQuery(api.reciepts.checkAiUsageLimit, 
    user ? { userId: user.id, feature: "receipt_scan" } : "skip"
  );

  const receiptSummaryUsage = useQuery(api.reciepts.checkAiUsageLimit, 
    user ? { userId: user.id, feature: "receipt_summary" } : "skip"
  );

  // Memoize the highest usage count to prevent unnecessary recalculations
  const maxUsageCount = useMemo(() => {
    return Math.max(
      aiInsightsUsage?.currentUsage || 0,
      receiptScanUsage?.currentUsage || 0,
      receiptSummaryUsage?.currentUsage || 0
    );
  }, [aiInsightsUsage?.currentUsage, receiptScanUsage?.currentUsage, receiptSummaryUsage?.currentUsage]);

  // Fetch access token only once when component mounts and user is available
  useEffect(() => {
    if (user && !accessToken && !isLoadingToken) {
      // Check cache first
      const cachedToken = TokenCacheManager.getToken(user.id);
      if (cachedToken) {
        setAccessToken(cachedToken);
        return;
      }

      // If no cached token, fetch new one
      setIsLoadingToken(true);
      getTemporaryAccessToken()
        .then((token) => {
          if (token) {
            setAccessToken(token);
            TokenCacheManager.setToken(user.id, token);
          }
        })
        .catch((error) => {
          console.error('Failed to get access token:', error);
        })
        .finally(() => {
          setIsLoadingToken(false);
        });
    }
  }, [user?.id]); // Only depend on user.id to prevent unnecessary re-runs

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Reset loading state on unmount
      setIsLoadingToken(false);
    };
  }, []);

  return (
    <div className='container xl:max-w-5xl mx-auto p-4 md:p-0'>
      <h1 className='text-2xl md:text-3xl font-bold mb-4 my-8'>Manage Plan</h1>
      <p className='text-gray-600 mb-6'>
        Manage your plan and billing details here. You can upgrade, downgrade, or cancel your subscription at any time. 
        For any issues, please contact support.
      </p>

      {user && (
        <div className="mb-8 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Current Usage</h2>
          
          {/* AI Insights Usage */}
          {aiInsightsUsage && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <h3 className="font-medium">AI Insights</h3>
                </div>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {aiInsightsUsage.currentUsage}/{aiInsightsUsage.limit === -1 ? '∞' : aiInsightsUsage.limit} used
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 bg-purple-500 rounded-full transition-all duration-300"
                  style={{ 
                    width: aiInsightsUsage.limit === -1 ? '0%' : `${Math.min((aiInsightsUsage.currentUsage / aiInsightsUsage.limit) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Receipt Scans Usage */}
          {receiptScanUsage && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <h3 className="font-medium">Receipt Scans</h3>
                </div>
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {receiptScanUsage.currentUsage}/{receiptScanUsage.limit === -1 ? '∞' : receiptScanUsage.limit} used
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                  style={{ 
                    width: receiptScanUsage.limit === -1 ? '0%' : `${Math.min((receiptScanUsage.currentUsage / receiptScanUsage.limit) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Receipt Summary Usage */}
          {receiptSummaryUsage && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  <h3 className="font-medium">Receipt Summaries</h3>
                </div>
                <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                  {receiptSummaryUsage.currentUsage}/{receiptSummaryUsage.limit === -1 ? '∞' : receiptSummaryUsage.limit} used
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 bg-green-500 rounded-full transition-all duration-300"
                  style={{ 
                    width: receiptSummaryUsage.limit === -1 ? '0%' : `${Math.min((receiptSummaryUsage.currentUsage / receiptSummaryUsage.limit) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Plan Limitation Banner */}
          {aiInsightsUsage?.planType === 'free' && (
            <PlanLimitationBanner
              feature="AI Features"
              currentPlan="free"
              usageCount={maxUsageCount}
              usageLimit={5}
              className="mt-4"
            />
          )}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          Billing & Subscription Management
        </h2>
        
        {isLoadingToken ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading billing portal...</span>
          </div>
        ) : accessToken && process.env.NEXT_PUBLIC_SCHEMATIC_CUSTOMEER_PORTAL_COMPONENT_ID ? (
          <SchematicEmbed 
            accessToken={accessToken} 
            componentId={process.env.NEXT_PUBLIC_SCHEMATIC_CUSTOMEER_PORTAL_COMPONENT_ID}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {!accessToken ? 'Unable to load billing portal. Please try refreshing the page.' : 'Billing portal is not configured.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManagePlan