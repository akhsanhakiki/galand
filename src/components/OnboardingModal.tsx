"use client";

import React from "react";
import { Modal } from "@heroui/react";
import OnboardingContent from "./OnboardingContent";

interface OnboardingModalProps {
  isOpen: boolean;
}

export default function OnboardingModal({ isOpen }: OnboardingModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      isDismissable={false}
      isKeyboardDismissDisabled={true}
    >
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-lg">
          <OnboardingContent variant="modal" />
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
