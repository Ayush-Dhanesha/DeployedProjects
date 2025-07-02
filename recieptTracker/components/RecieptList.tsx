'use client'

import { useUser } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import {api} from '@/convex/_generated/api';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"

import React, { use } from 'react'
import { ChevronRight, FileTextIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';



function ReceiptsList() {
    const router = useRouter();
    const {user} = useUser();
    const reciepts = useQuery(api.reciepts.getReciepts, {userId: user?.id || ''});  

    if(!user) {
        return(
        <div className="text-center w-full p-8">
            <p className='text-gray-600'> Please sign-in to view your reciept</p>
        </div>
        );
    }

    if(!reciepts) { 
        return (
            <div className="text-center w-full p-8">
                <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto'></div>
                    <p className='text-gray-600'>Loading your receipts...</p>
            </div>
        );
    }

    if(reciepts.length === 0) {
        return (
            <div className="text-center w-full p-8 border border-gray-200 rounded-lg bg-gray-50">
                <p className='text-gray-600'>You have no receipts yet.</p>
            </div>
        );
    }
  return (
    <div className='w-full max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md'>
        <h2 className='text-2xl font-semibold mb-4'>Your Receipts</h2>
        <div className='bg-white border border-gray-200 rounded-lg overflow-hidden'>
            <Table>
                <TableCaption>Your uploaded receipts</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className='w-[40px]'></TableHead>
                        <TableHead>File Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className='w-[40px]'></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reciepts.map((receipt) => (
                        <TableRow key={receipt._id} className='hover:bg-gray-50 transition-colors cursor-pointer' onClick={()=> router.push(`/reciepts/${receipt._id}`)}>
                            <TableCell> <FileTextIcon className='h-6 w-6 text-red-500'/></TableCell>
                            <TableCell className='font-medium'>{receipt.fileName}</TableCell>
                            <TableCell>{new Date(receipt.uploadedAt).toLocaleDateString()}</TableCell>
                            <TableCell>{(receipt.size / 1024).toFixed(2)} KB</TableCell>    
                            <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${receipt.status === "completed" ? "bg-green-100 text-green-800" : receipt.status === "processing" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                                    {(receipt.status?.charAt(0)?.toLocaleUpperCase() ?? "") + (receipt.status?.slice(1) ?? "")}
                                </span>
                            </TableCell>
                            <TableCell>
                                <ChevronRight className='h-5 w-5 text-gray-400 mx-auto' />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    </div>
  )
}

export default ReceiptsList