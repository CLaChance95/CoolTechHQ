import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "689139857cd2e16f4c77b7b2", 
  requiresAuth: true // Ensure authentication is required for all operations
});
