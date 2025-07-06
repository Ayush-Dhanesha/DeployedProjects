import AIInsightsFinal from '@/components/AIInsightsFinal';

export default function TestAI() {
  // Test receipt data
  const testReceipt = {
    receiptId: "test-receipt-id",
    receiptData: {
      merchantName: "Test Grocery Store",
      transactionAmount: 87.45,
      items: [
        {
          itemName: "Milk",
          quantity: 2,
          unitPrice: 3.99
        },
        {
          itemName: "Bread",
          quantity: 1,
          unitPrice: 4.49
        },
        {
          itemName: "Apples",
          quantity: 5,
          unitPrice: 0.79
        },
        {
          itemName: "Chicken Breast",
          quantity: 1,
          unitPrice: 12.99
        }
      ]
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">AI Insights Testing</h1>
      <div className="max-w-2xl mx-auto">
        <AIInsightsFinal 
          receiptId={testReceipt.receiptId} 
          receiptData={testReceipt.receiptData} 
        />
      </div>
    </div>
  );
}
