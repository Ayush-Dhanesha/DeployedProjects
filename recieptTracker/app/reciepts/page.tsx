// two Component receiptsList and pdfDropZone


import { Component } from 'lucide-react'
import React from 'react'
import PdfDropZone from '@/components/pdfDropZone'
import ReceiptsList from '@/components/RecieptList'

function receipts() {
  return (
    <div className='container mx-auto py-10 px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
            <PdfDropZone /> 

            
            <ReceiptsList />
        </div>
    </div>
  )
}

export default receipts