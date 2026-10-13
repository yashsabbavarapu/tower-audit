import { AuditApp } from "@/components/AuditApp";
import { graderInfo } from "@/lib/grader";

// The grader depends on runtime env (TOWER_GRADER and API keys), so render per request.
export const dynamic = "force-dynamic";

export default function Page() {
  return <AuditApp grader={graderInfo()} />;
}
