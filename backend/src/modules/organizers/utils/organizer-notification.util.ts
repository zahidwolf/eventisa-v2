import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import type { OrganizerNotificationPreferences } from "@/modules/organizers/types/organizer-settings.types.js";

export type OrganizerNotificationKey = keyof OrganizerNotificationPreferences;

export async function shouldNotifyOrganizer(
  organizerUserId: string,
  key: OrganizerNotificationKey
): Promise<boolean> {
  const organizer = await Organizer.findOne({ userId: organizerUserId }).select(
    "notificationPreferences"
  );
  if (!organizer) return true;
  const prefs = organizer.notificationPreferences;
  return prefs?.[key] !== false;
}
