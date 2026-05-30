import { DELIVERY_PLATFORM_OPTIONS } from '../constants/delivery-platform-options';

export function getDeliveryPlatformLabel(platformKey: string): string {
  if (!platformKey) return '';
  return DELIVERY_PLATFORM_OPTIONS.find((o) => o.value === platformKey)?.label ?? platformKey;
}
