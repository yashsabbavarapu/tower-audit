import type { Metadata } from "next";
import { ControlApp } from "@/components/ControlApp";
import { driftPoints } from "@/lib/control/grading";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tower Control",
  description: "Every agent output waits in the queue. You approve, it sends. Tower grades, traces, and remembers.",
};

export default async function Page() {
  const store = getStore();
  const [items, entries] = await Promise.all([store.listItems(), store.listAudit()]);
  return <ControlApp initial={{ items, entries, points: driftPoints(items), storage: store.kind }} />;
}
