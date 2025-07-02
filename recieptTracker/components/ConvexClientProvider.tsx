"use client";

import { ReactNode, useEffect } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { SchematicProvider,
  useSchematicEvents,
 } from "@schematichq/schematic-react";

import { useAuth, useUser } from "@clerk/nextjs";

// Initialize Convex client
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const SchematicWrapper = ({ children }: { children: React.ReactNode }) => {
  const { identify } = useSchematicEvents();
  const {user } = useUser();

  useEffect(() => {
    const userName = user?.fullName ?? user?.username ?? user?.emailAddresses[0].emailAddress ?? user?.id ?? "Guest";
    
    if (user?.id) {
      identify({
        name: userName,
        // user level keys
        keys :{
          id : user.id
        },
        company: {
          // company level keys
          keys : {
            id: user.id,
        },
        name: userName,
        // You can add more company level keys if needed
      },
      });
    }
  }, [user, identify]);

  return children ;
}

// Initialize Schematic SDK
export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>

      <SchematicProvider publishableKey={process.env.NEXT_PUBLIC_SCHEMATIC_KEY!}>
        <SchematicWrapper>
          {children}
        </SchematicWrapper>
      </SchematicProvider>
    </ConvexProviderWithClerk>
  );
}
