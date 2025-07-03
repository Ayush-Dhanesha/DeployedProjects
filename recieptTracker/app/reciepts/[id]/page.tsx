'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import Link from 'next/link';
import { ArrowLeftIcon, DownloadCloud, InboxIcon, Info, List, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useSchematicEntitlement } from '@schematichq/schematic-react';
import { useMutation } from 'convex/react';

function Reciept() {
    const params = useParams <{id: string}>();
    const [recieptId, setRecieptId] = useState<Id<"reciepts"> | null>(null);
    const router = useRouter();
    const [isSummaryVisible, setIsSummaryVisible] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const deleteRecieptMutation = useMutation(api.reciepts.deleteReciept);
    const { value: canViewSummary } = useSchematicEntitlement('summary');

    const reciept = useQuery(
        api.reciepts.getRecieptById,

        recieptId ? {
            recieptId: recieptId,
        }: "skip"
    );

    useEffect(() => {
        try {
            const id = params.id as Id<"reciepts">;
            setRecieptId(id);
        } catch (error) {
            console.error("Error fetching reciept", error);
            router.push('/');
        }
    }, [params.id, router]);

    if(reciept === undefined) {
        return(
            <div className='container mx-auto py-10 px-4'>
                <div className='flex flex-col items-center justify-center space-y-4'>
                    <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600'></div>
                    <div className='text-2xl font-bold'>Loading...</div>
                    <p className='text-gray-500'>The reciept you are looking for does not exist or has been removed</p>
                    <Link href='/' className='text-blue-600 hover:text-blue-700'>Go back to home</Link>
                </div>
            </div>
        )
    }
    const uploadDate = new Date(reciept?.uploadedAt || '').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const totalAmount = reciept?.items.reduce((acc, item) => acc + (item.unitPrice || 0) * (item.quantity || 0), 0);

    const items = reciept?.items.map((item) => (
        <div key={item.itemName} className='flex justify-between items-center py-2 border-b border-gray-200'>
            <div className='flex-1'>{item.itemName}</div>
            <div className='flex-1 text-right'>{item.quantity} x {item.unitPrice}</div>
        </div>
    ));
     
    return (
        <div className='container mx-auto py-10 px-4'>
            <div className='max-w-4xl mx-auto'>
                <nav className='mb-6'>
                    <Link href="/reciepts" className='text-blue-600 hover:text-blue-700 flex items-center space-x-2'>
                        <ArrowLeftIcon className='w-6 h-6' />Go back to reciepts.
                    </Link>
                </nav>
                <div className='bg-white shadow-md rounded-lg p-6'>
                    <div className='flex justify-between items-center mb-4'>
                        <div className='flex-1'>
                                <h2 className='text-2xl font-bold'>{reciept?.fileDisplayName || reciept?.fileName}</h2>
                            <p className='text-gray-500'>{uploadDate}</p>
                        </div>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-800 transition-colors shadow-md"
                        >
                            <Trash2 className="w-5 h-5 mr-2" /> Delete Receipt
                        </button>
                    </div>
                    <div className='flex items-center '>
                        {reciept?.status === "pending" ?(
                            <div className='mr-2'>
                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-800'></div>

                            </div>
                        ): null}
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${reciept?.status === "pending" ? 'text-yellow-800 bg-yellow-100' :reciept?.status === "processed"? 'text-green-600 bg-green-100' : ' text-red-800 bg-red-100' }`}>
                            {reciept?.status ? reciept.status.charAt(0).toUpperCase() + reciept.status.slice(1) : ''}
                        </span>
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
                    {/*Information Section*/}
                    <div className='bg-white shadow-md rounded-lg p-6'>
                        <h3 className='text-xl font-semibold mb-4'>
                            <Info/>Reciept Information</h3>
                        <div className='space-y-2'>
                            <p><strong>Reciept ID:</strong> {reciept?._id}</p>
                            <p><strong>Total Amount:</strong> ${totalAmount?.toFixed(2)}</p>
                            <p><strong>Uploaded at:</strong> {reciept?._creationTime}</p>
                        </div>
                    </div>
                    {/*Items Section*/}
                    <div className='bg-white shadow-md rounded-lg p-6'>
                        <h3 className='text-xl font-semibold mb-4'> 
                            <List/>Items</h3>
                        <div className='space-y-2'>
                            {items && items.length > 0 ? items : <p>No items found in this reciept.</p>}
                        </div>
                    </div>
                    {/*Download Section*/}
                    <div className='bg-white shadow-md rounded-lg p-6'>
                        <h3 className='text-xl font-semibold mb-4'>Download</h3>
                        <div className='space-y-2'>
                            <a href={reciept?.fileId} download className='text-blue-600 hover:text-blue-700'>Download Reciept File</a>
                            <DownloadCloud className='text-blue-600 hover:text-blue-700'/>
                            <p className='text-gray-500 text-sm'>File Name: {reciept?.fileName}</p>
                        </div>
                    </div>
                    
                </div>
                {/* AI Summary Section - Always visible with animations */}
                <div className="w-full flex flex-col items-center mt-8 animate-fadeIn">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150 shadow-lg hover:shadow-xl rounded-xl p-6 w-full max-w-2xl border border-blue-200 hover:border-blue-300 transition-all duration-300 ease-in-out transform hover:scale-[1.02]">
                        <h3 className="text-2xl font-bold mb-4 flex items-center text-blue-700 group">
                            <Info className="w-6 h-6 mr-2 text-blue-500 group-hover:text-blue-600 transition-colors duration-200" />
                            AI Receipt Summary
                        </h3>
                        {canViewSummary && reciept?.recieptSummary ? (
                            <div className="animate-slideInUp">
                                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line hover:text-gray-800 transition-colors duration-200">{reciept.recieptSummary}</p>
                            </div>
                        ) : (
                            <div className="bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 hover:border-yellow-300 text-yellow-800 rounded-lg p-4 w-full text-center shadow hover:shadow-md transition-all duration-300 ease-in-out animate-pulse-slow">
                                <h4 className="text-lg font-semibold mb-2 flex items-center justify-center group">
                                    <Info className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                                    {!canViewSummary ? "Summary Feature Locked" : "Summary Unavailable"}
                                </h4>
                                <p className="text-md hover:text-yellow-900 transition-colors duration-200">
                                    {!canViewSummary 
                                        ? "Upgrade your plan to access AI-powered receipt summaries and insights."
                                        : "Due to paid API keys for Anthropic and Cloud, the Inngest service cannot generate a summary for this receipt. If you would like to enable this feature, please contact the developer."
                                    }
                                </p>
                                {!canViewSummary && (
                                    <div className="mt-4">
                                        <Link href="/manage-plan" className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 hover:shadow-lg transform hover:scale-105">
                                            Upgrade Plan
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
                        <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full flex flex-col items-center">
                            <XCircle className="w-12 h-12 text-red-500 mb-4" />
                            <h4 className="text-lg font-bold mb-2">Are you sure you want to delete this receipt?</h4>
                            <p className="text-gray-600 mb-6 text-center">This action cannot be undone.</p>
                            <div className="flex space-x-4">
                                <button
                                    onClick={async () => {
                                        setDeleteError("");
                                        if (!recieptId) {
                                            setDeleteError("Invalid receipt ID.");
                                            return;
                                        }
                                        try {
                                            await deleteRecieptMutation({ recieptId });
                                            setDeleteSuccess(true);
                                            setTimeout(() => router.push('/reciepts'), 1200);
                                        } catch (err) {
                                            setDeleteError("Failed to delete receipt. Please try again.");
                                        }
                                    }}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center"
                                >
                                    <Trash2 className="w-4 h-4 mr-1" /> Yes, Delete
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                            {deleteSuccess && (
                                <div className="flex items-center text-green-600 mt-4"><CheckCircle className="w-5 h-5 mr-1" /> Receipt deleted!</div>
                            )}
                            {deleteError && (
                                <div className="flex items-center text-red-600 mt-4"><XCircle className="w-5 h-5 mr-1" /> {deleteError}</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Reciept;