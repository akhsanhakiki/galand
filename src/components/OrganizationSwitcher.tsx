"use client";

import React, { useState } from "react";
import { LuStore, LuChevronDown, LuX } from "react-icons/lu";
import { Button, Disclosure } from "@heroui/react";
import { useOrganization } from "../contexts/OrganizationContext";

interface OrganizationSwitcherProps {
  /** Compact mode for mobile header (icon + chevron); opens drawer on click */
  compact?: boolean;
}

function OrgListContent({
  currentOrganization,
  organizations,
  orgLoading,
  onSelectOrg,
}: {
  currentOrganization: ReturnType<typeof useOrganization>["currentOrganization"];
  organizations: ReturnType<typeof useOrganization>["organizations"];
  orgLoading: boolean;
  onSelectOrg: (org: NonNullable<ReturnType<typeof useOrganization>["currentOrganization"]>) => void;
}) {
  return (
    <>
      {orgLoading ? (
        <div className="flex items-center gap-2 p-3">
          <div className="w-8 h-8 rounded bg-default-200 animate-pulse shrink-0" />
          <div className="flex-1">
            <div className="h-3 w-24 bg-default-200 rounded animate-pulse mb-1" />
            <div className="h-2 w-16 bg-default-200 rounded animate-pulse" />
          </div>
        </div>
      ) : (
        organizations.map((org) => (
          <Button
            key={org.id}
            className={`w-full transition-all duration-200 rounded-2xl justify-start h-auto p-3 text-foreground ${
              currentOrganization?.id === org.id
                ? "bg-primary-100 text-primary-700 font-medium"
                : "hover:bg-default-100"
            }`}
            variant="ghost"
            onPress={() => onSelectOrg(org)}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {org.logo ? (
                <img
                  src={org.logo}
                  alt={org.name}
                  className="w-10 h-10 rounded shrink-0 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
                  <LuStore className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className="flex flex-col min-w-0 flex-1 text-left">
                <p className="text-sm font-medium text-foreground truncate">
                  {org.name}
                </p>
                <p className="text-xs text-muted truncate">{org.slug}</p>
              </div>
            </div>
          </Button>
        ))
      )}
    </>
  );
}

export default function OrganizationSwitcher({ compact = false }: OrganizationSwitcherProps) {
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const {
    currentOrganization,
    organizations,
    loading: orgLoading,
    setCurrentOrganization,
  } = useOrganization();

  const handleOrganizationSelect = async (
    org: NonNullable<typeof currentOrganization>,
  ) => {
    try {
      await setCurrentOrganization(org);
      setIsOrgDropdownOpen(false);
      setIsDrawerOpen(false);
    } catch {
      // Handle error silently
    }
  };

  const triggerCompact = (
    <Button
      className="min-w-0 h-9 rounded-2xl justify-center gap-1.5 px-2 hover:bg-default-100 text-foreground max-w-[140px] sm:max-w-[180px]"
      variant="ghost"
      onPress={() => compact && setIsDrawerOpen(true)}
    >
      {orgLoading ? (
        <div className="w-5 h-5 rounded bg-default-200 animate-pulse shrink-0" />
      ) : currentOrganization?.logo ? (
        <img
          src={currentOrganization.logo}
          alt={currentOrganization.name}
          className="w-5 h-5 rounded object-cover shrink-0"
        />
      ) : (
        <LuStore className="w-5 h-5 text-primary shrink-0" />
      )}
      {currentOrganization?.name ? (
        <span className="text-xs font-medium text-foreground truncate text-left min-w-0">
          {currentOrganization.name}
        </span>
      ) : orgLoading ? null : (
        <span className="text-xs text-muted truncate min-w-0">Toko</span>
      )}
      <LuChevronDown className="w-4 h-4 shrink-0" />
    </Button>
  );

  if (compact) {
    return (
      <>
        {triggerCompact}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 bg-background flex flex-col h-full">
            <div className="w-full px-4 py-2 flex items-center justify-between border-b border-default-200 shrink-0">
              <h2 className="text-lg font-bold text-foreground">Pilih toko</h2>
              <Button
                variant="ghost"
                isIconOnly
                size="sm"
                onPress={() => setIsDrawerOpen(false)}
              >
                <LuX className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-1">
                <OrgListContent
                  currentOrganization={currentOrganization}
                  organizations={organizations}
                  orgLoading={orgLoading}
                  onSelectOrg={handleOrganizationSelect}
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <Disclosure
      isExpanded={isOrgDropdownOpen}
      onExpandedChange={setIsOrgDropdownOpen}
      className="w-full max-w-[220px]"
    >
      <Disclosure.Heading>
        <Button
          slot="trigger"
          className="w-full transition-all duration-200 rounded-2xl justify-between h-auto p-2 hover:bg-default-100 text-foreground min-h-10"
          variant="ghost"
        >
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            {orgLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-default-200 animate-pulse shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-3 w-24 bg-default-200 rounded animate-pulse mb-1" />
                  <div className="h-2 w-16 bg-default-200 rounded animate-pulse" />
                </div>
              </div>
            ) : currentOrganization ? (
              <div className="flex items-center gap-2">
                {currentOrganization.logo ? (
                  <img
                    src={currentOrganization.logo}
                    alt={currentOrganization.name}
                    className="w-8 h-8 rounded object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                    <LuStore className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className="flex flex-col min-w-0 flex-1 text-left">
                  <p className="text-sm font-medium text-foreground truncate">
                    {currentOrganization.name}
                  </p>
                  <p className="text-[10px] text-muted truncate">
                    {currentOrganization.slug}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-default-200 flex items-center justify-center shrink-0">
                  <LuStore className="w-4 h-4 text-default-400" />
                </div>
                <div className="flex flex-col min-w-0 flex-1 text-left">
                  <p className="text-sm font-medium text-muted truncate">
                    Tidak ada toko
                  </p>
                </div>
              </div>
            )}
          </div>
          <Disclosure.Indicator>
            <LuChevronDown
              className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOrgDropdownOpen ? "rotate-180" : ""}`}
            />
          </Disclosure.Indicator>
        </Button>
      </Disclosure.Heading>
      <Disclosure.Content>
        <Disclosure.Body className="flex flex-col gap-1 max-h-48 overflow-y-auto">
          <OrgListContent
            currentOrganization={currentOrganization}
            organizations={organizations}
            orgLoading={orgLoading}
            onSelectOrg={handleOrganizationSelect}
          />
        </Disclosure.Body>
      </Disclosure.Content>
    </Disclosure>
  );
}
