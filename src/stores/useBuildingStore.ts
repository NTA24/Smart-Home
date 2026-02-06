import { create } from 'zustand'

export interface Building {
  id: number
  name: string
  address: string
  floors: number
  people: number
  power: number
  energy?: number
  alerts?: number
  energyPercent?: number
  status: string
  image?: string
}

// Mock data for buildings
export const buildings: Building[] = [
  {
    id: 1,
    name: 'Viettel Tower',
    address: '255 Cách Mạng Tháng 8, Q.10, TP-HCM',
    floors: 35,
    people: 7,
    power: 152,
    energy: 1520,
    alerts: 2,
    energyPercent: 80,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    name: 'Viettel Complex',
    address: '255 Cách Mạng Tháng 8, Q.10, TP-HCM',
    floors: 35,
    people: 5,
    power: 120,
    energy: 1520,
    alerts: 2,
    energyPercent: 61,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1554435493-93422e8220c8?w=400&h=300&fit=crop',
  },
  {
    id: 3,
    name: 'Viettel Đà Nẵng',
    address: '78 Ngũ Gia Tự, Q.3, Đà Nẵng',
    floors: 18,
    people: 3,
    power: 85,
    energy: 850,
    alerts: 1,
    energyPercent: 45,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1577985043696-8bd54d9f093f?w=400&h=300&fit=crop',
  },
]

interface BuildingState {
  selectedBuilding: Building | null
  buildings: Building[]
  setSelectedBuilding: (building: Building) => void
  selectBuildingById: (id: number) => void
}

export const useBuildingStore = create<BuildingState>((set) => ({
  selectedBuilding: null,
  buildings: buildings,
  
  setSelectedBuilding: (building) => {
    set({ selectedBuilding: building })
  },
  
  selectBuildingById: (id) => {
    const building = buildings.find(b => b.id === id)
    if (building) {
      set({ selectedBuilding: building })
    }
  },
}))
