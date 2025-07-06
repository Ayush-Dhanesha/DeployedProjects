import { Inngest } from 'inngest';
// Import the Inngest client from the inngest package.

// Ensure we have a proper configuration
if (!process.env.INNGEST_EVENT_KEY) {
  console.warn("INNGEST_EVENT_KEY is not set. Inngest functions may not work correctly.");
}

export const inngest = new Inngest({
  id: 'receipt-tracker',
  name: 'Receipt Tracker Inngest Client',
  // This is the base URL for your Inngest instance, which you can find in your Inngest dashboard.
  // If you're using the Inngest Cloud, you can leave this as is.
  baseURL: process.env.NEXT_PUBLIC_INNGEST_BASE_URL || 'https://api.inngest.com',
  eventKey: process.env.INNGEST_EVENT_KEY, // Ensure this is properly passed
});