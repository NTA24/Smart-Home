export { useAppStore } from './useAppStore'
export { useTabStore, routeToLabelKey } from './useTabStore'
export type { Tab } from './useTabStore'
export { useBuildingStore } from './useBuildingStore'
export type { Building } from './useBuildingStore'
export { useHomeNavigationStore } from './useHomeNavigationStore'
export type { HomeStep } from './useHomeNavigationStore'
export { useUserStore } from './useUserStore'
export type { UserRole } from './useUserStore'

/**
 * @deprecated Dùng ADMIN1_HIDDEN_GROUP_KEYS từ '@/layouts/components/menuConfig' thay thế.
 * Re-export để tránh break các file cũ đang import từ stores.
 */
export { ADMIN1_HIDDEN_GROUPS } from './useUserStore'
