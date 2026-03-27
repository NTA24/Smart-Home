export {
  default as api,
  CHAT_WITH_AI_URL,
  postChatWithAi,
  dashboardApi,
  parkingApi,
  parkingDashboardApi,
  parkingSubscriptionApi,
  parkingEventsApi,
  parkingAccessControlApi,
  parkingTicketsApi,
  parkingConfigApi,
  parkingPricingApi,
  deviceApi,
  energyApi,
} from './api'
export type { ChatWithAiResponse } from './chatApi'
export type {
  ParkingDashboardStats,
  ParkingDashboardTraffic,
  ParkingDashboardRevenue,
  ParkingZone,
  ParkingZonesListResponse,
  ParkingSpot,
  ParkingSpotsListResponse,
  ParkingVehicle,
  ParkingVehiclesListResponse,
  ParkingSubscriptionItem,
  ParkingSubscriptionsListResponse,
  ParkingSubscriptionCheckResponse,
  ParkingSubscriptionCreateBody,
  ParkingEventItem,
  ParkingEventsListResponse,
  ParkingEventBulkItem,
  ParkingEventBulkResponse,
  ConfirmEntranceBody,
  ConfirmExitPaymentBody,
  AllowExitBySubscriptionBody,
  AdminForceExitBody,
  ParkingTicketItem,
  ParkingTicketsListResponse,
  ParkingConfigItem,
  ParkingConfigUpdateBody,
  ParkingPricingItem,
  ParkingPricingUpsertItem,
  ParkingPricingUpsertBody,
  ParkingPricingListResponse,
  AccessControlRecentItem,
} from './types/parking.api.types'
export { tenantApi } from './tenantApi'
export { campusApi } from './campusApi'
export { buildingApi } from './buildingApi'
export { energyMeterApi } from './energyMeterApi'
export { hvacAssetApi } from './hvacAssetApi'
export { iaqSensorApi } from './iaqSensorApi'
export { energyAggregateApi } from './energyAggregateApi'
export { energyTelemetryApi } from './energyTelemetryApi'
export { iaqTelemetryApi } from './iaqTelemetryApi'
export { hvacTelemetryApi } from './hvacTelemetryApi'
export {
  energyMvApi,
  type MvDeviceDayParams,
  type MvBuildingDayParams,
  type MvDeviceDayResponse,
  type MvBuildingDayResponse,
} from './energyMvApi'
export { spaceApi } from './spaceApi'
export type { SpaceItem } from './spaceApi'
export {
  thingsBoardApi,
  thingsBoardLogin,
  setThingsBoardToken,
  setThingsBoardRefreshToken,
  getThingsBoardToken,
  setThingsBoardApiKey,
  getThingsBoardApiKey,
  clearThingsBoardAuth,
  thingsBoardRequest,
} from './thingsboardApi'
export type {
  ThingsBoardLoginRequest,
  ThingsBoardLoginResponse,
  ThingsBoardDeviceInfo,
  ThingsBoardDeviceInfosResponse,
  SaveDeviceBody,
  EntitiesQueryFindBody,
  ThingsBoardAssetInfo,
  ThingsBoardAssetInfosResponse,
  ThingsBoardAssetProfileInfosResponse,
  ThingsBoardEntityViewInfo,
  ThingsBoardEntityViewInfosResponse,
} from './thingsboardApi'
export { buildEntitiesQueryFindPayload } from './thingsboardApi'
export {
  logout,
  AuthErrorCode,
  ApiAuthError,
  normalizeAxiosAuthError,
  isApiAuthError,
  getAuthStrategy,
  setAccessToken,
  getAccessToken,
} from '@/lib/auth'
export type { AuthErrorCodeValue } from '@/lib/auth'
export * from './types'
