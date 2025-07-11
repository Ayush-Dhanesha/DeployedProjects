'use client'

import { useUser } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import React, { useState } from 'react';
import { Sparkles, Grid3X3, List, Filter, Search } from 'lucide-react';
import ReceiptSummaryCard from './ReceiptSummaryCard';

export default function ReceiptsWithSummaries() {
  const { user } = useUser();
  const receipts = useQuery(api.reciepts.getReciepts, { userId: user?.id || '' });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'processing' | 'with-summary'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!user) {
    return (
      <div className="text-center w-full p-8">
        <p className="text-gray-600">Please sign-in to view your receipt summaries</p>
      </div>
    );
  }

  if (!receipts) {
    return (
      <div className="text-center w-full p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading your receipts...</p>
      </div>
    );
  }

  // Filter receipts based on current filters
  const filteredReceipts = receipts.filter(receipt => {
    // Status filter
    if (filterStatus === 'completed' && receipt.status !== 'completed') return false;
    if (filterStatus === 'processing' && receipt.status !== 'processing') return false;
    if (filterStatus === 'with-summary' && !receipt.recieptSummary) return false;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        receipt.fileName.toLowerCase().includes(searchLower) ||
        receipt.merchantName?.toLowerCase().includes(searchLower) ||
        receipt.recieptSummary?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const summaryCount = receipts.filter(r => r.recieptSummary).length;
  const processingCount = receipts.filter(r => r.status === 'processing').length;

  if (receipts.length === 0) {
    return (
      <div className="text-center w-full p-8 border border-gray-200 rounded-lg bg-gray-50">
        <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No receipts available for AI analysis yet.</p>
        <p className="text-sm text-gray-500 mt-2">Upload some receipts to see AI-generated summaries here!</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6 border border-purple-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Receipt Summaries</h2>
              <p className="text-gray-600">
                {summaryCount} of {receipts.length} receipts have AI-generated summaries
                {processingCount > 0 && (
                  <span className="text-yellow-600 ml-2">
                    ({processingCount} processing)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap gap-4 mt-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search receipts, merchants, or summaries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Receipts</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="with-summary">With AI Summary</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {(searchTerm || filterStatus !== 'all') && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredReceipts.length} of {receipts.length} receipts
          {searchTerm && (
            <span> matching "{searchTerm}"</span>
          )}
        </div>
      )}

      {/* No Results */}
      {filteredReceipts.length === 0 ? (
        <div className="text-center w-full p-8 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-gray-600">No receipts match your current filters.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
            }}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            Clear filters
          </button>
        </div>
      ) : (
        /* Receipts Grid/List */
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredReceipts.map((receipt) => (
            <ReceiptSummaryCard
              key={receipt._id}
              receipt={receipt}
            />
          ))}
        </div>
      )}

      {/* Loading State for Processing Receipts */}
      {processingCount > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-700">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-yellow-600"></div>
            <span className="text-sm font-medium">
              {processingCount} receipt{processingCount !== 1 ? 's' : ''} currently processing
            </span>
          </div>
          <p className="text-xs text-yellow-600 mt-1">
            AI summaries will appear automatically once processing is complete. This page will update in real-time.
          </p>
        </div>
      )}
    </div>
  );
}
