"use server";

import { currentUser } from "@clerk/nextjs/server";
import { cache } from "react";

// Initialize Schematic SDK
import { SchematicClient } from "@schematichq/schematic-typescript-node";
const apiKey = process.env.SCHEMATIC_API_KEY;
const client = new SchematicClient({ apiKey });

// Cache the token for 10 minutes to prevent excessive API calls
const getCachedTemporaryAccessToken = cache(async (userId: string) => {
    console.log(`Issuing access token for user: ${userId}`);
    
    const resp = await client.accesstokens.issueTemporaryAccessToken({
        resourceType: "company",
        lookup: {id: userId}
    });
    
    console.log("Temporary access token issued successfully",
        resp.data ? "token received" : "no token received"
    );

    return resp.data?.token || null;
});

//get temporary access token
export async function getTemporaryAccessToken() {
    console.log("Getting temporary access token");

    const user = await currentUser();

    if (!user) {
        console.log("No user found");
        return null;
    }

    return getCachedTemporaryAccessToken(user.id);
}