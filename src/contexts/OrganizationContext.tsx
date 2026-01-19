"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authClient } from "../utils/auth";
import { useAuth } from "./AuthContext";

// Type for Neon Auth Organization (based on the documentation)
interface NeonOrganization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  members?: Array<{
    id: string;
    userId: string;
    role: string;
    user: {
      id: string;
      email: string;
      name: string;
      image: string | null;
    };
  }>;
}

interface OrganizationContextType {
  currentOrganization: NeonOrganization | null;
  organizations: NeonOrganization[];
  loading: boolean;
  organizationChangeKey: number; // Key that increments when organization changes, used to trigger refetch
  setCurrentOrganization: (org: NeonOrganization | null) => Promise<void>;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentOrganization, setCurrentOrganizationState] = useState<NeonOrganization | null>(null);
  const [organizations, setOrganizations] = useState<NeonOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationChangeKey, setOrganizationChangeKey] = useState(0);

  // Fetch organizations and active organization
  const refreshOrganizations = useCallback(async () => {
    if (!user) {
      setOrganizations([]);
      setCurrentOrganizationState(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch all organizations the user belongs to
      const { data: orgsList, error: orgsError } = await authClient.organization.list();
      
      console.log('=== Neon Auth Organization.list() Result ===');
      console.log('Organizations list:', orgsList);
      console.log('Organizations error:', orgsError);
      console.log('============================================');
      
      if (orgsError) {
        setOrganizations([]);
        setCurrentOrganizationState(null);
        setLoading(false);
        return;
      }

      const orgs = orgsList || [];
      setOrganizations(orgs);

      // Fetch active organization details
      const { data: activeOrg, error: activeError } = await authClient.organization.getFullOrganization({
        query: {
          membersLimit: 100,
        },
      });
      
      console.log('=== Neon Auth getFullOrganization() Result ===');
      console.log('Active organization:', activeOrg);
      console.log('Active organization error:', activeError);
      if (activeOrg) {
        console.log('Active org keys:', Object.keys(activeOrg));
        console.log('Active org ID:', activeOrg.id);
        console.log('Active org name:', activeOrg.name);
      }
      console.log('==============================================');

      if (activeError || !activeOrg) {
        // If no active org, use first organization if available
        if (orgs.length > 0) {
          const firstOrg = orgs[0];
          // Set first org as active if none is active
          await authClient.organization.setActive({ organizationId: firstOrg.id });
          setCurrentOrganizationState(firstOrg);
        } else {
          setCurrentOrganizationState(null);
        }
      } else {
        setCurrentOrganizationState(activeOrg);
      }
    } catch (error) {
      setOrganizations([]);
      setCurrentOrganizationState(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const setCurrentOrganization = useCallback(async (org: NeonOrganization | null) => {
    if (!org) {
      // Unset active organization
      const { error } = await authClient.organization.setActive({ organizationId: null });
      if (error) {
        throw new Error(error.message || "Failed to unset active organization");
      }
      setCurrentOrganizationState(null);
      // Increment key to trigger refetch in all pages
      setOrganizationChangeKey((prev) => prev + 1);
      return;
    }

    // Set active organization using Neon Auth
    const { error } = await authClient.organization.setActive({
      organizationId: org.id,
    });

    if (error) {
      throw new Error(error.message || "Failed to set active organization");
    }

    // Refresh to get updated active organization with full details
    await refreshOrganizations();
    // Increment key to trigger refetch in all pages
    setOrganizationChangeKey((prev) => prev + 1);
  }, [refreshOrganizations]);

  // Initial load and refresh when user changes
  useEffect(() => {
    refreshOrganizations();
  }, [refreshOrganizations]);

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        organizations,
        loading,
        organizationChangeKey,
        setCurrentOrganization,
        refreshOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
}
