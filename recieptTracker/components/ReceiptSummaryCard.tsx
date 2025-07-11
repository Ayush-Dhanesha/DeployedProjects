'use client'

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Sparkles, Calendar, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReceiptSummaryCardProps {
  receipt: {
    _id: string;
    fileName: string;
    uploadedAt: number;
    size: number;
    status?: string;
    merchantName?: string;
    transactionAmount?: number;
    transactionDate?: number;
    recieptSummary?: string;
    items?: Array<{
      itemName: string;
      quantity: number;
      unitPrice?: number;
    }>;
  };
}

export default function ReceiptSummaryCard({ receipt }: ReceiptSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/reciepts/${receipt._id}`);
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const truncateSummary = (summary: string, maxLength: number = 120) => {
    if (summary.length <= maxLength) return summary;
    return summary.substring(0, maxLength) + '...';
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Header Section */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate text-lg">
                {receipt.merchantName || 'Unknown Merchant'}
              </h3>
              <p className="text-sm text-gray-500 truncate">{receipt.fileName}</p>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {new Date(receipt.uploadedAt).toLocaleDateString()}
                </div>
                {receipt.transactionAmount && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <DollarSign className="h-3 w-3" />
                    {formatCurrency(receipt.transactionAmount)}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              receipt.status === "completed" 
                ? "bg-green-100 text-green-800" 
                : receipt.status === "processing" 
                ? "bg-yellow-100 text-yellow-800" 
                : "bg-red-100 text-red-800"
            }`}>
              {(receipt.status?.charAt(0)?.toUpperCase() ?? "") + (receipt.status?.slice(1) ?? "")}
            </span>
          </div>
        </div>
      </div>

      {/* AI Summary Section */}
      {receipt.recieptSummary && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-700">AI Summary</span>
            </div>
            <button
              onClick={handleToggleExpand}
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 transition-colors"
            >
              {isExpanded ? (
                <>
                  <span>Show Less</span>
                  <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  <span>Show More</span>
                  <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          </div>
          
          <div className="text-sm text-gray-700 leading-relaxed">
            {isExpanded ? (
              <p className="whitespace-pre-line">{receipt.recieptSummary}</p>
            ) : (
              <p>{truncateSummary(receipt.recieptSummary)}</p>
            )}
          </div>

          {/* Items Preview */}
          {receipt.items && receipt.items.length > 0 && (
            <div className="mt-3 pt-3 border-t border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-purple-700">
                  Items ({receipt.items.length})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {receipt.items.slice(0, isExpanded ? receipt.items.length : 2).map((item, index) => (
                  <div key={index} className="text-xs bg-white/60 rounded px-2 py-1">
                    <span className="font-medium">{item.itemName}</span>
                    {item.quantity > 1 && (
                      <span className="text-gray-500 ml-1">x{item.quantity}</span>
                    )}
                    {item.unitPrice && (
                      <span className="text-gray-600 ml-1">
                        ({formatCurrency(item.unitPrice)})
                      </span>
                    )}
                  </div>
                ))}
                {!isExpanded && receipt.items.length > 2 && (
                  <div className="text-xs text-purple-600 px-2 py-1">
                    +{receipt.items.length - 2} more items...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Summary State */}
      {!receipt.recieptSummary && receipt.status === "completed" && (
        <div className="p-4 bg-gray-50">
          <div className="flex items-center gap-2 text-gray-500">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">No AI summary available</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Summary generation may not be available for this receipt
          </p>
        </div>
      )}

      {/* Processing State */}
      {receipt.status === "processing" && (
        <div className="p-4 bg-yellow-50">
          <div className="flex items-center gap-2 text-yellow-700">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-yellow-600"></div>
            <span className="text-sm">AI is processing this receipt...</span>
          </div>
          <p className="text-xs text-yellow-600 mt-1">
            Summary will be available once processing is complete
          </p>
        </div>
      )}

      {/* Action Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Size: {(receipt.size / 1024).toFixed(2)} KB
          </div>
          <button
            onClick={handleViewDetails}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors duration-200"
          >
            View Details
            <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
          </button>
        </div>
      </div>
    </div>
  );
}
