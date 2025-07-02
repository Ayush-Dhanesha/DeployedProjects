"use Server"
import convex from "@/lib/ConvexClients";
import { api } from "@/convex/_generated/api";
import { Id  } from "@/convex/_generated/dataModel";

export async function getFileDownloadUrl(fileId: Id<"_storage"> | string) {
    try {
        const downloadUrl = await convex.query(api.reciepts.getrecieptDownloadUrl, { fileId : fileId as Id<"_storage"> });

        if (!downloadUrl) {
            throw new Error("Download URL not found for the provided file ID.");
        }
        return downloadUrl;
    } catch (error) {
        console.error("Error fetching file download URL:", error);
        throw new Error("Failed to retrieve file download URL.");
    }
}
