'use client';

import React from 'react';
import { AlertCircle, Sparkles, Zap } from 'lucide-react';

interface PlanLimitationBannerProps {
  feature: string;
  currentPlan: 'free' | 'pro' | 'enterprise';
  usageCount?: number;
  usageLimit?: number;
  className?: string;
}

export default function PlanLimitationBanner({ 
  feature, 
  currentPlan, 
  usageCount = 0, 
  usageLimit = 5,
  className = "" 
}: PlanLimitationBannerProps) {
  
  const isFreePlan = currentPlan === 'free';
  const isNearLimit = usageCount >= usageLimit * 0.8;
  const isAtLimit = usageCount >= usageLimit;

  if (!isFreePlan) return null;

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {isAtLimit ? (
            <AlertCircle className="h-5 w-5 text-orange-500" />
          ) : (
            <Sparkles className="h-5 w-5 text-blue-500" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              {isAtLimit ? 'Usage Limit Reached' : `Free Plan - ${feature}`}
            </h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {usageCount}/{usageLimit} used
            </span>
          </div>
          
          <div className="mt-2">
            {isAtLimit ? (
              <p className="text-sm text-gray-600">
                You've reached your monthly limit for {feature.toLowerCase()}. 
                Upgrade to continue using AI features.
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                You have <span className="font-semibold text-blue-600">{usageLimit - usageCount} scans</span> remaining this month. 
                {isNearLimit && " You're close to your limit!"}
              </p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Monthly Usage</span>
              <span>{Math.round((usageCount / usageLimit) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  isAtLimit ? 'bg-red-500' : 
                  isNearLimit ? 'bg-orange-500' : 
                  'bg-blue-500'
                }`}
                style={{ width: `${Math.min((usageCount / usageLimit) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Upgrade CTA */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Upgrade for unlimited scans + advanced AI features
            </div>
            <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
              <Zap className="h-3 w-3 mr-1" />
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
