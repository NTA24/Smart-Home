import { create } from 'zustand'

export type UserRole = 'admin' | 'admin1'

interface UserState {
  currentUser: UserRole
  switchUser: (user: UserRole) => void
}

const STORAGE_KEY = 'app.currentUser'

function readSavedUser(): UserRole {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'admin1' ? 'admin1' : 'admin'
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: readSavedUser(),
  switchUser: (user) => {
    localStorage.setItem(STORAGE_KEY, user)
    set({ currentUser: user })
  },
}))

/** Menu groups hidden for admin1 */
export const ADMIN1_HIDDEN_GROUPS = new Set([
  'robot-management',
  'smart-workspace',
  'smart-meeting-room',
])
