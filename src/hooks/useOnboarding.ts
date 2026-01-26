import { useState, useEffect, useMemo } from "react";
import { useOrganization } from "../contexts/OrganizationContext";
import { useAuth } from "../contexts/AuthContext";
import { getTransactions } from "../utils/api/transactions";

export function useOnboarding() {
  const { currentOrganization, loading: orgLoading } = useOrganization();
  const { user, loading: authLoading } = useAuth();
  const [hasTransactions, setHasTransactions] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const shouldShowOnboarding = useMemo(() => {
    // Don't show if still loading
    if (authLoading || orgLoading || isChecking) {
      return false;
    }

    // Don't show if no user
    if (!user) {
      return false;
    }

    // Don't show if user has organization
    if (currentOrganization) {
      return false;
    }

    // Show if no organization and no transactions
    if (hasTransactions === false) {
      return true;
    }

    // Still checking transactions
    return false;
  }, [currentOrganization, orgLoading, authLoading, user, hasTransactions, isChecking]);

  useEffect(() => {
    let cancelled = false;

    const checkOnboarding = async () => {
      // Wait for auth and org to load
      if (authLoading || orgLoading) {
        return;
      }

      // If user is not logged in, don't show onboarding
      if (!user) {
        if (!cancelled) {
          setHasTransactions(null);
          setIsChecking(false);
        }
        return;
      }

      // If user has organization, don't show onboarding
      if (currentOrganization) {
        if (!cancelled) {
          setHasTransactions(null);
          setIsChecking(false);
        }
        return;
      }

      // User has no organization - check if they have transactions
      setIsChecking(true);
      try {
        const transactions = await getTransactions(0, 1);
        const hasAnyTransactions = transactions.length > 0;
        
        if (!cancelled) {
          setHasTransactions(hasAnyTransactions);
          setIsChecking(false);
        }
      } catch (error) {
        // If error fetching transactions, assume no transactions
        if (!cancelled) {
          setHasTransactions(false);
          setIsChecking(false);
        }
      }
    };

    checkOnboarding();

    return () => {
      cancelled = true;
    };
  }, [currentOrganization, orgLoading, authLoading, user]);

  return {
    shouldShowOnboarding,
    isChecking: isChecking || authLoading || orgLoading,
  };
}
