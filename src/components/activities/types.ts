import type { Activity } from "@/types/db";
import type { ActivityRegistrationSummary } from "@/types/db";

export interface ActivityCardProps {
  activity: Activity;
  summary: ActivityRegistrationSummary;
  alreadyRegistered?: boolean;
}
