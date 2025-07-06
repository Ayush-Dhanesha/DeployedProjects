'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function InngestDebug() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testInngestDirect = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/inngest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'ai/analyze-receipt',
          data: {
            receiptId: 'test-receipt-id',
            receiptData: {
              merchantName: 'Test Merchant',
              transactionAmount: 42.99,
              items: [
                {
                  itemName: 'Test Item',
                  quantity: 1,
                  unitPrice: 42.99
                }
              ]
            },
            userId: 'test-user-id'
          }
        })
      });

      const text = await response.text();
      setResult({
        status: response.status,
        statusText: response.statusText,
        text: text
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };
  
  const testSimplifiedInngest = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/test-inngest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'ai/analyze-receipt',
          data: {
            receiptId: 'test-receipt-id',
            receiptData: {
              merchantName: 'Test Merchant',
              transactionAmount: 42.99,
              items: [
                {
                  itemName: 'Test Item',
                  quantity: 1,
                  unitPrice: 42.99
                }
              ]
            },
            userId: 'test-user-id'
          }
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const testDebugEndpoint = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/debug-inngest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'ai/analyze-receipt',
          data: {
            receiptId: 'test-receipt-id',
            receiptData: {
              merchantName: 'Test Merchant',
              transactionAmount: 42.99,
              items: [
                {
                  itemName: 'Test Item',
                  quantity: 1,
                  unitPrice: 42.99
                }
              ]
            },
            userId: 'test-user-id'
          }
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Inngest Debug Tool</h1>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={testInngestDirect} 
            disabled={loading}
          >
            Test Direct Inngest API
          </Button>
          
          <Button 
            onClick={testDebugEndpoint} 
            disabled={loading}
          >
            Test Debug Endpoint
          </Button>

          <Button 
            onClick={testSimplifiedInngest} 
            disabled={loading}
            variant="outline"
          >
            Test Simplified Inngest
          </Button>
        </div>
        
        {loading && <p>Loading...</p>}
        {error && <div className="p-3 bg-red-50 text-red-700 rounded border border-red-300">{error}</div>}
        
        {result && (
          <div className="p-3 bg-gray-50 rounded border">
            <h3 className="font-bold mb-2">Result:</h3>
            <pre className="whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
