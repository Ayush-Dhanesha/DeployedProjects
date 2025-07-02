"use server";

import { currentUser } from "@clerk/nextjs/server";

// Initialize Schematic SDK

import { SchematicClient } from "@schematichq/schematic-typescript-node";
const apiKey = process.env.SCHEMATIC_API_KEY;
const client = new SchematicClient({ apiKey });

//get temporary access token

export async function getTemporaryAccessToken() {

    console.log("Getting temporary access token");

    const user = await currentUser();

    if (!user) {
        console.log("No user found");
        return null;
    }
    console.log(`issuing the access token for user : ${user.id}`);

    const resp = await client.accesstokens.issueTemporaryAccessToken({
        resourceType: "company",
        lookup: {id: user.id}
        
    });
    console.log("Temporary access token issued successfully",
        resp.data ? "token recieved" : "no token received"
    );

    return resp.data?.token || null;
}