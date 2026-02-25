const STORAGE_KEYS = {
  workspaceRooms: 'smart-home.workspace.rooms',
  workspaceIssues: 'smart-home.workspace.issues',
  workspaceBookings: 'smart-home.workspace.bookings',
  meetingRooms: 'smart-home.meeting.rooms',
  meetingIssues: 'smart-home.meeting.issues',
  meetingBookings: 'smart-home.meeting.bookings',
  meetingDetailControls: 'smart-home.meeting.detail.controls',
  meetingKioskState: 'smart-home.meeting.kiosk.state',
  peoplePersonnel: 'smart-home.people.personnel',
  peopleVisitors: 'smart-home.people.visitors',
  peoplePersonnelFilters: 'smart-home.people.personnel.filters',
  peopleVisitorFilters: 'smart-home.people.visitor.filters',
  peopleGateHistory: 'smart-home.people.gate.history',
  energyMeters: 'smart-home.energy.meters',
  hvacAssets: 'smart-home.energy.hvac-assets',
  iaqSensors: 'smart-home.energy.iaq-sensors',
  energyAggregates: 'smart-home.energy.aggregates',
  energyTelemetryQuery: 'smart-home.energy.telemetry.query',
  energyTelemetryIngestDraft: 'smart-home.energy.telemetry.ingest.draft',
  hvacTelemetryQuery: 'smart-home.energy.hvac.query',
  hvacTelemetryIngestDraft: 'smart-home.energy.hvac.ingest.draft',
  iaqTelemetryQuery: 'smart-home.energy.iaq.query',
  iaqTelemetryIngestDraft: 'smart-home.energy.iaq.ingest.draft',
  energyAlarmStatisticsFilters: 'smart-home.energy.alarmStatistics.filters',
  energyMonitoringFilters: 'smart-home.energy.monitoring.filters',
  robotManagementItems: 'smart-home.robot.management.items',
  robotManagementFilters: 'smart-home.robot.management.filters',
  robotDashboardFilters: 'smart-home.robot.dashboard.filters',
  robotLiveFleetFilters: 'smart-home.robot.liveFleet.filters',
  robotAlertsFilters: 'smart-home.robot.alerts.filters',
  vehicleTickets: 'smart-home.vehicle.tickets',
  vehicleTicketFilters: 'smart-home.vehicle.ticket.filters',
  vehicleSubscriptions: 'smart-home.vehicle.subscriptions',
  vehicleSubscriptionFilters: 'smart-home.vehicle.subscription.filters',
  vehicleDevices: 'smart-home.vehicle.devices',
  vehicleDeviceFilters: 'smart-home.vehicle.device.filters',
  vehicleSlots: 'smart-home.vehicle.slots',
  vehicleMapFilters: 'smart-home.vehicle.map.filters',
  vehicleRecentVehicles: 'smart-home.vehicle.recentVehicles',
  vehicleManagementFilters: 'smart-home.vehicle.management.filters',
  vehicleLiveEntranceEntries: 'smart-home.vehicle.liveEntrance.entries',
  vehicleLiveEntranceState: 'smart-home.vehicle.liveEntrance.state',
  vehicleLiveExitEntries: 'smart-home.vehicle.liveExit.entries',
  vehicleLiveExitState: 'smart-home.vehicle.liveExit.state',
  vehiclePricingConfig: 'smart-home.vehicle.pricing.config',
  vehicleManagementConfig: 'smart-home.vehicle.management.config',
} as const

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

function migrateOccurredAtField<T>(items: T[]): { items: T[]; migrated: boolean } {
  let migrated = false
  const normalized = items.map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return item
    const row = item as Record<string, unknown>
    if ('occuredAt' in row && !('occurredAt' in row)) {
      const { occuredAt, ...rest } = row
      migrated = true
      return { ...rest, occurredAt: occuredAt } as T
    }
    return item
  })
  return { items: normalized, migrated }
}

function migratePeopleVisitors<T>(items: T[], seed: T[]): { items: T[]; migrated: boolean } {
  let migrated = false
  const normalized = items.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return item

    const row = item as Record<string, unknown>
    const nextRow: Record<string, unknown> = { ...row }
    let rowChanged = false

    const reason = typeof row.reason === 'string' ? row.reason.trim() : ''
    const appointmentType = typeof row.appointmentType === 'string' ? row.appointmentType : ''
    if (reason.toLowerCase() === 'corporate visit') {
      nextRow.reason = appointmentType === 'interview' ? 'Phỏng vấn' : 'Tham quan doanh nghiệp'
      rowChanged = true
    }

    const licensePlate = typeof row.licensePlate === 'string' ? row.licensePlate.trim() : ''
    const isLegacyPlate =
      /^guangdong\b/i.test(licensePlate) || /^not at the morr/i.test(licensePlate) || licensePlate.length === 0
    if (isLegacyPlate) {
      const seedRow = seed[index] as Record<string, unknown> | undefined
      const seedPlate = typeof seedRow?.licensePlate === 'string' ? seedRow.licensePlate : ''
      nextRow.licensePlate = seedPlate || `30A-${String(index + 1).padStart(3, '0')}.00`
      rowChanged = true
    }

    if (rowChanged) {
      migrated = true
      return nextRow as T
    }
    return item
  })

  return { items: normalized, migrated }
}

export interface IssueTicketPayload {
  room: string
  issueType: string
  severity: string
  description: string
}

export type IssueStatus = 'open' | 'in_progress' | 'resolved'

export interface IssueTicket extends IssueTicketPayload {
  id: string
  createdAt: string
  status: IssueStatus
}

export function getWorkspaceRooms<T>(seed: T[]): T[] {
  const cached = readJson<T[]>(STORAGE_KEYS.workspaceRooms, [])
  return cached.length > 0 ? cached : seed
}

export function saveWorkspaceRooms<T>(rooms: T[]) {
  writeJson(STORAGE_KEYS.workspaceRooms, rooms)
}

export function createWorkspaceIssueTicket(payload: IssueTicketPayload): string {
  const items = readJson<IssueTicket[]>(STORAGE_KEYS.workspaceIssues, [])
  const id = `TK-${String(items.length + 1).padStart(4, '0')}`
  items.unshift({ id, createdAt: new Date().toISOString(), status: 'open', ...payload })
  writeJson(STORAGE_KEYS.workspaceIssues, items)
  return id
}

export function createMeetingIssueTicket(payload: IssueTicketPayload): string {
  const items = readJson<IssueTicket[]>(STORAGE_KEYS.meetingIssues, [])
  const id = `MR-${String(items.length + 1).padStart(4, '0')}`
  items.unshift({ id, createdAt: new Date().toISOString(), status: 'open', ...payload })
  writeJson(STORAGE_KEYS.meetingIssues, items)
  return id
}

export function getWorkspaceIssues(): IssueTicket[] {
  const items = readJson<IssueTicket[]>(STORAGE_KEYS.workspaceIssues, [])
  return items.map((item) => ({ ...item, status: item.status || 'open' }))
}

export function getMeetingIssues(): IssueTicket[] {
  const items = readJson<IssueTicket[]>(STORAGE_KEYS.meetingIssues, [])
  return items.map((item) => ({ ...item, status: item.status || 'open' }))
}

export function updateWorkspaceIssueStatus(id: string, status: IssueStatus) {
  const items = getWorkspaceIssues().map((item) => (item.id === id ? { ...item, status } : item))
  writeJson(STORAGE_KEYS.workspaceIssues, items)
}

export function updateMeetingIssueStatus(id: string, status: IssueStatus) {
  const items = getMeetingIssues().map((item) => (item.id === id ? { ...item, status } : item))
  writeJson(STORAGE_KEYS.meetingIssues, items)
}

export function getMeetingBookings<T>(seed: T[]): T[] {
  const cached = readJson<T[]>(STORAGE_KEYS.meetingBookings, [])
  return cached.length > 0 ? cached : seed
}

export function saveMeetingBookings<T>(bookings: T[]) {
  writeJson(STORAGE_KEYS.meetingBookings, bookings)
}

export function getWorkspaceBookings<T>(seed: T[] = []): T[] {
  const cached = readJson<T[]>(STORAGE_KEYS.workspaceBookings, [])
  return cached.length > 0 ? cached : seed
}

export function saveWorkspaceBookings<T>(bookings: T[]) {
  writeJson(STORAGE_KEYS.workspaceBookings, bookings)
}

export function getMeetingRooms<T>(seed: T[]): T[] {
  const cached = readJson<T[]>(STORAGE_KEYS.meetingRooms, [])
  return cached.length > 0 ? cached : seed
}

export function saveMeetingRooms<T>(rooms: T[]) {
  writeJson(STORAGE_KEYS.meetingRooms, rooms)
}

export interface MeetingDetailControls {
  activeScene: string
  lightLevel: number
  acTemp: number
  tvOn: boolean
  projectorOn: boolean
  audioOn: boolean
  volume: number
}

export function getMeetingDetailControls(seed: MeetingDetailControls): MeetingDetailControls {
  return readJson<MeetingDetailControls>(STORAGE_KEYS.meetingDetailControls, seed)
}

export function saveMeetingDetailControls(value: MeetingDetailControls) {
  writeJson(STORAGE_KEYS.meetingDetailControls, value)
}

export interface MeetingKioskState {
  checkedIn: boolean
}

export function getMeetingKioskState(seed: MeetingKioskState): MeetingKioskState {
  return readJson<MeetingKioskState>(STORAGE_KEYS.meetingKioskState, seed)
}

export function saveMeetingKioskState(value: MeetingKioskState) {
  writeJson(STORAGE_KEYS.meetingKioskState, value)
}

export function getPeoplePersonnel<T>(seed: T[]): T[] {
  const cached = readJson<T[]>(STORAGE_KEYS.peoplePersonnel, [])
  return cached.length > 0 ? cached : seed
}

export function savePeoplePersonnel<T>(items: T[]) {
  writeJson(STORAGE_KEYS.peoplePersonnel, items)
}

export function getPeopleVisitors<T>(seed: T[]): T[] {
  const cached = readJson<T[]>(STORAGE_KEYS.peopleVisitors, [])
  if (cached.length === 0) return seed
  const { items, migrated } = migratePeopleVisitors(cached, seed)
  if (migrated) writeJson(STORAGE_KEYS.peopleVisitors, items)
  return items
}

export function savePeopleVisitors<T>(items: T[]) {
  writeJson(STORAGE_KEYS.peopleVisitors, items)
}

export function getPeoplePersonnelFilters<T>(seed: T): T {
  return readJson<T>(STORAGE_KEYS.peoplePersonnelFilters, seed)
}

export function savePeoplePersonnelFilters<T>(value: T) {
  writeJson(STORAGE_KEYS.peoplePersonnelFilters, value)
}

export function getPeopleVisitorFilters<T>(seed: T): T {
  return readJson<T>(STORAGE_KEYS.peopleVisitorFilters, seed)
}

export function savePeopleVisitorFilters<T>(value: T) {
  writeJson(STORAGE_KEYS.peopleVisitorFilters, value)
}

export function getPeopleGateHistory<T>(seed: T[] = []): T[] {
  const cached = readJson<T[]>(STORAGE_KEYS.peopleGateHistory, [])
  return cached.length > 0 ? cached : seed
}

export function savePeopleGateHistory<T>(items: T[]) {
  writeJson(STORAGE_KEYS.peopleGateHistory, items)
}

export function getEnergyMeters<T>(seed: T[] = []): T[] {
  const cached = readJson<T[]>(STORAGE_KEYS.energyMeters, [])
  return cached.length > 0 ? cached : seed
}

export function saveEnergyMeters<T>(items: T[]) {
  writeJson(STORAGE_KEYS.energyMeters, items)
}

export function getHvacAssets<T>(seed: T[] = []): T[] {
  const cached = readJson<T[]>(STORAGE_KEYS.hvacAssets, [])
  return cached.length > 0 ? cached : seed
}

export function saveHvacAssets<T>(items: T[]) {
  writeJson(STORAGE_KEYS.hvacAssets, items)
}

export function getIaqSensors<T>(seed: T[] = []): T[] {
  const cached = readJson<T[]>(STORAGE_KEYS.iaqSensors, [])
  return cached.length > 0 ? cached : seed
}

export function saveIaqSensors<T>(items: T[]) {
  writeJson(STORAGE_KEYS.iaqSensors, items)
}

export function getEnergyAggregates<T>(seed: T[] = []): T[] {
  const cached = readJson<T[]>(STORAGE_KEYS.energyAggregates, [])
  return cached.length > 0 ? cached : seed
}

export function saveEnergyAggregates<T>(items: T[]) {
  writeJson(STORAGE_KEYS.energyAggregates, items)
}

export function getEnergyTelemetryQuery<T>(seed: T): T {
  return readJson<T>(STORAGE_KEYS.energyTelemetryQuery, seed)
}

export function saveEnergyTelemetryQuery<T>(value: T) {
  writeJson(STORAGE_KEYS.energyTelemetryQuery, value)
}

export function getEnergyTelemetryIngestDraft<T>(seed: T): T {
  return readJson<T>(STORAGE_KEYS.energyTelemetryIngestDraft, seed)
}

export function saveEnergyTelemetryIngestDraft<T>(value: T) {
  writeJson(STORAGE_KEYS.energyTelemetryIngestDraft, value)
}

export function getHvacTelemetryQuery<T>(seed: T): T {
  return readJson<T>(STORAGE_KEYS.hvacTelemetryQuery, seed)
}

export function saveHvacTelemetryQuery<T>(value: T) {
  writeJson(STORAGE_KEYS.hvacTelemetryQuery, value)
}

export function getHvacTelemetryIngestDraft<T>(seed: T): T {
  return readJson<T>(STORAGE_KEYS.hvacTelemetryIngestDraft, seed)
}

export function saveHvacTelemetryIngestDraft<T>(value: T) {
  writeJson(STORAGE_KEYS.hvacTelemetryIngestDraft, value)
}

export function getIaqTelemetryQuery<T>(seed: T): T {
  return readJson<T>(STORAGE_KEYS.iaqTelemetryQuery, seed)
}

export function saveIaqTelemetryQuery<T>(value: T) {
  writeJson(STORAGE_KEYS.iaqTelemetryQuery, value)
}

export function getIaqTelemetryIngestDraft<T>(seed: T): T {
  return readJson<T>(STORAGE_KEYS.iaqTelemetryIngestDraft, seed)
}

export function saveIaqTelemetryIngestDraft<T>(value: T) {
  writeJson(STORAGE_KEYS.iaqTelemetryIngestDraft, value)
}

export function getEnergyAlarmStatisticsFilters<T>(seed: T): T {
  return readJson<T>(STORAGE_KEYS.energyAlarmStatisticsFilters, seed)
}

export function saveEnergyAlarmStatisticsFilters<T>(value: T) {
  writeJson(STORAGE_KEYS.energyAlarmStatisticsFilters, value)
}

export function getEnergyMonitoringFilters<T>(seed: T): T {
  return readJson<T>(STORAGE_KEYS.energyMonitoringFilters, seed)
}

export function saveEnergyMonitoringFilters<T>(value: T) {
  writeJson(STORAGE_KEYS.energyMonitoringFilters, value)
}

export function getRobotManagementItems<T>(seed: T[] = []): T[] {
  const cached = readJson<T[]>(STORAGE_KEYS.robotManagementItems, [])
  return cached.length > 0 ? cached : seed
}

export function saveRobotManagementItems<T>(items: T[]) {
  writeJson(STORAGE_KEYS.robotManagementItems, items)
}

export function getRobotManagementFilters<T>(seed: T): T {
  return readJson<T>(STORAGE_KEYS.robotManagementFilters, seed)
}

export function saveRobotManagementFilters<T>(value: T) {
  writeJson(STORAGE_KEYS.robotManagementFilters, value)
}

export function getRobotDashboardFilters<T>(seed: T): T {
  return readJson<T>(STORAGE_KEYS.robotDashboardFilters, seed)
}

export function saveRobotDashboardFilters<T>(value: T) {
  writeJson(STORAGE_KEYS.robotDashboardFilters, value)
}

export function getRobotLiveFleetFilters<T>(seed: T): T {
  return readJson<T>(STORAGE_KEYS.robotLiveFleetFilters, seed)
}

export function saveRobotLiveFleetFilters<T>(value: T) {
  writeJson(STORAGE_KEYS.robotLiveFleetFilters, value)
}

export function getRobotAlertsFilters<T>(seed: T): T {
  return readJson<T>(STORAGE_KEYS.robotAlertsFilters, seed)
}

export function saveRobotAlertsFilters<T>(value: T) {
  writeJson(STORAGE_KEYS.robotAlertsFilters, value)
}

export function getVehicleTickets<T>(seed: T[] = []): T[] {
  const cached = readJson<T[]>(STORAGE_KEYS.vehicleTickets, [])
  return cached.length > 0 ? cached : seed
}

export function saveVehicleTickets<T>(items: T[]) {
  writeJson(STORAGE_KEYS.vehicleTickets, items)
}

export function getVehicleTicketFilters<T>(seed: T): T {
  return readJson<T>(STORAGE_KEYS.vehicleTicketFilters, seed)
}

export function saveVehicleTicketFilters<T>(value: T) {
  writeJson(STORAGE_KEYS.vehicleTicketFilters, value)
}

export function getVehicleSubscriptions<T>(seed: T[] = []): T[] {
  const cached = readJson<T[]>(STORAGE_KEYS.vehicleSubscriptions, [])
  return cached.length > 0 ? cached : seed
}

export function saveVehicleSubscriptions<T>(items: T[]) {
  writeJson(STORAGE_KEYS.vehicleSubscriptions, items)
}

export function getVehicleSubscriptionFilters<T>(seed: T): T {
  return readJson<T>(STORAGE_KEYS.vehicleSubscriptionFilters, seed)
}

export function saveVehicleSubscriptionFilters<T>(value: T) {
  writeJson(STORAGE_KEYS.vehicleSubscriptionFilters, value)
}

export function getVehicleDevices<T>(seed: T[] = []): T[] {
  const cached = readJson<T[]>(STORAGE_KEYS.vehicleDevices, [])
  return cached.length > 0 ? cached : seed
}

export function saveVehicleDevices<T>(items: T[]) {
  writeJson(STORAGE_KEYS.vehicleDevices, items)
}

export function getVehicleDeviceFilters<T>(seed: T): T {
  return readJson<T>(STORAGE_KEYS.vehicleDeviceFilters, seed)
}

export function saveVehicleDeviceFilters<T>(value: T) {
  writeJson(STORAGE_KEYS.vehicleDeviceFilters, value)
}

export function getVehicleSlots<T>(seed: T[] = []): T[] {
  const cached = readJson<T[]>(STORAGE_KEYS.vehicleSlots, [])
  return cached.length > 0 ? cached : seed
}

export function saveVehicleSlots<T>(items: T[]) {
  writeJson(STORAGE_KEYS.vehicleSlots, items)
}

export function getVehicleMapFilters<T>(seed: T): T {
  return readJson<T>(STORAGE_KEYS.vehicleMapFilters, seed)
}

export function saveVehicleMapFilters<T>(value: T) {
  writeJson(STORAGE_KEYS.vehicleMapFilters, value)
}

export function getVehicleRecentVehicles<T>(seed: T[] = []): T[] {
  const cached = readJson<T[]>(STORAGE_KEYS.vehicleRecentVehicles, [])
  return cached.length > 0 ? cached : seed
}

export function saveVehicleRecentVehicles<T>(items: T[]) {
  writeJson(STORAGE_KEYS.vehicleRecentVehicles, items)
}

export function getVehicleManagementFilters<T>(seed: T): T {
  return readJson<T>(STORAGE_KEYS.vehicleManagementFilters, seed)
}

export function saveVehicleManagementFilters<T>(value: T) {
  writeJson(STORAGE_KEYS.vehicleManagementFilters, value)
}

export function getVehicleLiveEntranceEntries<T>(seed: T[] = []): T[] {
  const cached = readJson<T[]>(STORAGE_KEYS.vehicleLiveEntranceEntries, [])
  if (cached.length === 0) return seed
  const { items, migrated } = migrateOccurredAtField(cached)
  if (migrated) writeJson(STORAGE_KEYS.vehicleLiveEntranceEntries, items)
  return items
}

export function saveVehicleLiveEntranceEntries<T>(items: T[]) {
  writeJson(STORAGE_KEYS.vehicleLiveEntranceEntries, items)
}

export function getVehicleLiveEntranceState<T>(seed: T): T {
  return readJson<T>(STORAGE_KEYS.vehicleLiveEntranceState, seed)
}

export function saveVehicleLiveEntranceState<T>(value: T) {
  writeJson(STORAGE_KEYS.vehicleLiveEntranceState, value)
}

export function getVehicleLiveExitEntries<T>(seed: T[] = []): T[] {
  const cached = readJson<T[]>(STORAGE_KEYS.vehicleLiveExitEntries, [])
  if (cached.length === 0) return seed
  const { items, migrated } = migrateOccurredAtField(cached)
  if (migrated) writeJson(STORAGE_KEYS.vehicleLiveExitEntries, items)
  return items
}

export function saveVehicleLiveExitEntries<T>(items: T[]) {
  writeJson(STORAGE_KEYS.vehicleLiveExitEntries, items)
}

export function getVehicleLiveExitState<T>(seed: T): T {
  return readJson<T>(STORAGE_KEYS.vehicleLiveExitState, seed)
}

export function saveVehicleLiveExitState<T>(value: T) {
  writeJson(STORAGE_KEYS.vehicleLiveExitState, value)
}

export function getVehiclePricingConfig<T>(seed: T): T {
  return readJson<T>(STORAGE_KEYS.vehiclePricingConfig, seed)
}

export function saveVehiclePricingConfig<T>(value: T) {
  writeJson(STORAGE_KEYS.vehiclePricingConfig, value)
}

export function getVehicleManagementConfig<T>(seed: T): T {
  return readJson<T>(STORAGE_KEYS.vehicleManagementConfig, seed)
}

export function saveVehicleManagementConfig<T>(value: T) {
  writeJson(STORAGE_KEYS.vehicleManagementConfig, value)
}
