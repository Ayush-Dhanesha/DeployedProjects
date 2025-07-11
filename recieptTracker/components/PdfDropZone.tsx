"use client";

import { useUser } from '@clerk/clerk-react';
import {DndContext,useSensor,PointerSensor,useSensors} from '@dnd-kit/core'
import { useRouter } from 'next/navigation';
import { useSchematicEntitlement } from '@schematichq/schematic-react'
import { uploadPDF } from '@/actions/uploadPDF'


import React, { useRef, useState, useCallback, useEffect } from 'react'
import { AlertCircle, CheckCircle, CloudUpload } from 'lucide-react';

function PdfDropZone() {

    //

    const sensors= useSensors(useSensor(PointerSensor))
    
    // Define the drop zone props
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<String[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [currentUrl, setCurrentUrl] = useState('');

    const {user} =useUser();
    // Check if the user is authenticated
    const router = useRouter(); 
    const {
        value: isFeatureEnabled,featureUsageExceeded,featureAllocation
    } = useSchematicEntitlement("scans");
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    
    // Set current URL on client side only
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentUrl(window.location.href);
        }
    }, []);
    
    //Setup the DnD sensors for drag and drop functionality


    const handleDragOver =useCallback((event: React.DragEvent) => {
        event.preventDefault();
        setIsDraggingOver(true);
    }
    , []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(false);
    }, []);

    const handleUploadFiles = useCallback(async (files: FileList) => {
        if(!user) {
            alert('You must be signed in to upload files.');
            // Redirect to Clerk sign-in page with the current URL as the redirect_url
            if (typeof window !== 'undefined') {
                window.location.href = 'https://wise-whale-35.accounts.dev/sign-in?redirect_url=' + encodeURIComponent(currentUrl || window.location.href);
            }
            return;
        }

        const fileArray = Array.from(files);
        const pdfFiles = fileArray.filter(file => file.type === 'application/pdf' || file.name.endsWith('.pdf'));
        if(pdfFiles.length === 0) {
            alert('Please upload only PDF files.');
            return;
        }

        setIsUploading(true);
        try {
            
            const newUploadedFiles :string[] =[];
            for(const file of pdfFiles) {
                
                const formData = new FormData();
                formData.append('file', file);

                const result = await uploadPDF(formData);

                if (result && result.success) {
                    newUploadedFiles.push(file.name);
                } else {
                    alert(`Failed to upload ${file.name}: ${result?.error ?? 'Unknown error'}`);
                }
            }
            setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
            alert(`Successfully uploaded ${newUploadedFiles.length} files.`);

            setTimeout(() => {
                setUploadedFiles([]); // Clear uploaded files after 5 seconds
            }, 5000);
            router.push('/reciepts'); // Redirect to the receipts page after upload
            // Here you would typically send the files to your server or API endpoint
        } catch (error) {
            console.error('File upload failed:', error);
            alert('Failed to upload files. Please try again.');
        }finally {
            setIsUploading(false);
        }
    
    },[user, router, currentUrl]);
    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files.length > 0) {
            handleUploadFiles(e.target.files);
        }
    }, [handleUploadFiles]);
    
    const triggerFileInput = useCallback(() => {
        if(fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, [fileInputRef]);


    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(false);
        
        if(!user){
            alert('You must be signed in to upload files.');
            // Redirect to Clerk sign-in page with the current URL as the redirect_url
            if (typeof window !== 'undefined') {
                window.location.href = 'https://wise-whale-35.accounts.dev/sign-in?redirect_url=' + encodeURIComponent(currentUrl || window.location.href);
            }
            return;
        }

        if(e.dataTransfer.files && e.dataTransfer.files.length > 0){
            handleUploadFiles(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    }, [user , handleUploadFiles, currentUrl]);
    const isUserSignedIn = !!user;
    // Allow uploads for all signed-in users - backend will handle usage limits
    const canUpload = isUserSignedIn;
    // Define the drop zone component

  return (
    <DndContext sensors={sensors}>
      <div className='w-full flex items-center justify-center'>
        <div
          onDragOver={canUpload ? handleDragOver : undefined}
          onDragLeave={canUpload ? handleDragLeave : undefined}
          onDrop={canUpload ? handleDrop : (e)=>e.preventDefault()}
          className={`border-2 border-dashed border-gray-400 rounded-lg w-full max-w-2xl py-8 md:py-12 px-2 md:px-8 text-center bg-white ${isDraggingOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} ${!canUpload ? 'cursor-pointer opacity-70' : 'cursor-not-allowed'} ${canUpload ? 'hover:bg-blue-50 transition-colors' : ''}`}
        >
          <h2 className='text-2xl md:text-3xl font-semibold mb-4'>Drop your PDF files here</h2>
          { isUploading ? (
              <div className='flex items-center justify-center space-x-2'>
                <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500'></div>
                <span className='text-gray-700'>Uploading...</span>
              </div>
            ) : !isUserSignedIn ? (
              <div className='text-gray-500'>
                Please <a href={'https://wise-whale-35.accounts.dev/sign-in?redirect_url=' + encodeURIComponent(currentUrl)} className='text-blue-500 hover:underline'>sign in</a> to upload files.
              </div>
            ) : (
              <>
                <CloudUpload className='w-16 h-16 text-blue-500 mb-4 mx-auto' />
                <p className='text-gray-600 mb-4'>Drag and drop your PDF files here or click to select files.</p>
                <input
                  type='file'
                  accept='application/pdf'
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileInput}
                  className='hidden'
                />
                <button
                  onClick={triggerFileInput}
                  className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
                  disabled={!canUpload}
                >
                  {canUpload ? 'Select Files' : 'Sign In to Upload'}
                </button>
              </>
            )}
        </div>
        <div className='mt-4'>
          {featureUsageExceeded && (
            <div className='flex item-center bg-red-50 text-red-600 border-red-200 p-3 rounded-md'>
              <AlertCircle className='w-5 h-5 mr-2 flex-shrink-0' />
              <span>
                You have exceeded your scan limit for this month. Please upgrade your plan to continue uploading.
              </span>
            </div>
          )}
        </div>
      </div>
    </DndContext>
  )
}

export default PdfDropZone