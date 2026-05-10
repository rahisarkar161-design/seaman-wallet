/**
 * Notification stubs — full expo-notifications integration works in a native
 * build/EAS build. In this Expo Go / web preview the hooks are no-ops because
 * expo-notifications pulls packages that trip Metro's file watcher on Replit.
 *
 * To enable real notifications:
 *   1. Run: pnpm --filter @workspace/mobile add expo-notifications@~0.32.17
 *   2. Uncomment the real implementation below.
 *   3. Build with EAS or run on a real device with Expo Go.
 */

export type NotificationDoc = {
  id: string;
  type: string;
  name: string;
  expiryDate: string;
};

export async function requestNotificationPermissions(): Promise<boolean> {
  return false;
}

export async function scheduleDocumentNotifications(
  _doc: NotificationDoc
): Promise<string[]> {
  return [];
}

export async function cancelDocumentNotifications(
  _ids: string[]
): Promise<void> {
  // no-op
}
