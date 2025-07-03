'use server'

import { api } from "@/convex/_generated/api";
import convex from "@/lib/ConvexClients";
import { currentUser } from "@clerk/nextjs/server"
import { get } from "http";
import type { Id } from "@/convex/_generated/dataModel";
import { inngest } from "@/inngest/client";
import Events from "@/inngest/constants";
import { url } from "inspector";

async function getFileDownloadUrl(fileId: Id<"_storage">) {
    return await convex.query(api.reciepts.getrecieptDownloadUrl, { fileId });
}

export async function uploadPDF(formData: FormData) {

    const user = await currentUser();
    if (!user) {
        return { success: false, error: "User not authenticated" };
    }

    try {
        const file = formData.get('file') as File;

        if(!file || file.type !== 'application/pdf') {
            return { success: false, error: "Invalid file type. Please upload a PDF." };
        }

        const uploadUrl =await convex.mutation(api.reciepts.generateUploadUrl, {}); 

        const arrayBuffer = await file.arrayBuffer();
        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Content-Type': file.type,
            },
            body:new Uint8Array( arrayBuffer),
        });
        if (!response.ok) {
            throw new Error(`Upload failed with status: ${response.status}`);
        }

        const {storageId} = await response.json();

        const recieptId = await convex.mutation(api.reciepts.storeReciept, {
            fileId: storageId,
            fileName: file.name,
            userId: user.id,
            size: file.size,
            mimType: file.type,
            uploadedAt: Date.now(),
        });

        const fileUrl = await getFileDownloadUrl(storageId);

        // trigger inngest agent workFlow here
        await inngest.send({
            name: Events.EXTRACT_DATA_FROM_PDF_AND_SAVE_TO_DATABASE,
            data: {
                url: fileUrl,
                recieptId,
            },
        });

        return { success: true, data: { recieptId, fileName: file.name } };

    }catch (error) {
        console.error("File upload error:", error);
        return { success: false, error: "File upload failed. Please try again." };
    }
}