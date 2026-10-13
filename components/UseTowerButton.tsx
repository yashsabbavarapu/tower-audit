"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { AUDIT_FIELD_ID, MORPH_NAME, waitForAudit } from "@/lib/morph";
import { Button } from "./Button";

/** Amber CTA that grows into the audit textarea (View Transitions API; plain navigation elsewhere). */
export function UseTowerButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    router.prefetch("/audit");
  }, [router]);

  const focusField = () => document.getElementById(AUDIT_FIELD_ID)?.focus({ preventScroll: true });

  const go = () => {
    if (!document.startViewTransition) {
      router.push("/audit");
      return;
    }
    const button = ref.current;
    if (button) button.style.viewTransitionName = MORPH_NAME;
    const transition = document.startViewTransition(() => {
      // The old snapshot is taken; drop the name so the audit textarea owns it.
      if (button) button.style.viewTransitionName = "";
      const mounted = waitForAudit();
      router.push("/audit");
      return mounted;
    });
    transition.finished.then(focusField, focusField);
  };

  return (
    <Button ref={ref} variant="primary" onClick={go} className={className}>
      Use Tower
    </Button>
  );
}
