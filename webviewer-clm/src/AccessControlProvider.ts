import { AccessControlProvider } from "@refinedev/core";
import { supabaseClient } from "./utility";

let currentUser: any = null;

// Listen to auth state changes
supabaseClient.auth.onAuthStateChange((event, session) => {
  currentUser = session?.user ?? null;
});

// Initialize on load
supabaseClient.auth.getUser().then(({ data }) => {
  currentUser = data?.user ?? null;
});

const AccessControlProvider: AccessControlProvider = {
  can: async ({ resource, action }) => {
    // Get user data from Supabase
    if (!currentUser) {
      return { can: false };
    }

    const userRole = currentUser.user_metadata.role;

    if (userRole === "admin") {
      return { can: true };
    }

    if (resource === "agreements") {
      return { can: true };
    }

    return { can: false };
  },
};

export default AccessControlProvider;