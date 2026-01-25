"use client";

import React from "react";
import OnboardingContent from "../../components/OnboardingContent";

export default function OnboardingPage() {
  // Render the onboarding content as a page in the right section
  return (
    <div className="flex flex-col w-full gap-5 h-full">
      <OnboardingContent />
    </div>
  );
}
