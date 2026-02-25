export interface RobotManagementItem {
  id: string
  name: string
  type: 'delivery' | 'cleaning' | 'patrol'
  status: 'idle' | 'running' | 'charging' | 'error' | 'offline'
  battery: number
  floor: string
  zone: string
  lastSeen: string
}

export const seedRobotManagementItems: RobotManagementItem[] = [
  { id: 'R-01', name: 'Lobby Runner', type: 'delivery', status: 'idle', battery: 68, floor: 'B1', zone: 'Lobby', lastSeen: '2026-02-23 10:20' },
  { id: 'R-03', name: 'Patrol East', type: 'patrol', status: 'running', battery: 55, floor: 'B1', zone: 'Hallway', lastSeen: '2026-02-23 10:22' },
  { id: 'R-05', name: 'Dock Assistant', type: 'cleaning', status: 'charging', battery: 88, floor: 'B1', zone: 'Dock A', lastSeen: '2026-02-23 10:19' },
  { id: 'R-07', name: 'Delivery Prime', type: 'delivery', status: 'error', battery: 32, floor: 'B1', zone: 'Corridor C', lastSeen: '2026-02-23 10:14' },
  { id: 'R-09', name: 'Clean North', type: 'cleaning', status: 'running', battery: 72, floor: '1F', zone: 'North Wing', lastSeen: '2026-02-23 10:23' },
  { id: 'R-12', name: 'Courier 12', type: 'delivery', status: 'idle', battery: 40, floor: '2F', zone: 'Meeting Zone', lastSeen: '2026-02-23 10:21' },
]
