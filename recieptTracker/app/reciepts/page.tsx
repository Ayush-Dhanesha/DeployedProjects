// two Component receiptsList and pdfDropZone


import { Component } from 'lucide-react'
import React from 'react'
import PdfDropZone from '@/components/PdfDropZone'
import ReceiptsList from '@/components/RecieptList'
import ReceiptsWithSummaries from '@/components/ReceiptsWithSummaries'

function receipts() {
  return (
    <div className='container mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-10'>
            <PdfDropZone /> 
            <ReceiptsList />
        </div>
        
        {/* AI Summaries Section */}
        <div className='mt-8'>
            <ReceiptsWithSummaries />
        </div>
    </div>
  )
}

export default receipts