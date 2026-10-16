import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Category } from './data'
import { findBody } from './data'

type CameraMode = 'orbit' | 'focus' | 'follow' | 'free-fly' | 'surface' | 'tour'
type State = {
  selectedId: string
  category: Category
  favorites: string[]
  searchOpen: boolean
  infoOpen: boolean
  timeRate: number
  showOrbits: boolean
  autoTour: boolean
  cameraMode: CameraMode
  select: (id: string) => void
  setCategory: (category: Category) => void
  toggleFavorite: (id: string) => void
  setSearchOpen: (value: boolean) => void
  setInfoOpen: (value: boolean) => void
  setTimeRate: (value: number) => void
  setShowOrbits: (value: boolean) => void
  setAutoTour: (value: boolean) => void
  setCameraMode: (mode: CameraMode) => void
}

export const useStore = create<State>()(persist((set) => ({
  selectedId: 'universe', category: 'overview', favorites: [], searchOpen: false, infoOpen: false,
  timeRate: 1, showOrbits: true, autoTour: false, cameraMode: 'orbit',
  select: (id) => set({ selectedId: id, category: findBody(id).category, searchOpen: false, infoOpen: false, cameraMode: 'focus' }),
  setCategory: (category) => set({ category, selectedId: ({ overview:'universe', galaxy:'milky-way', solar:'solar-system', constellation:'orion', nebula:'carina', blackhole:'blackhole', fantasy:'aethera' } as Record<Category,string>)[category], infoOpen:false, cameraMode:'orbit' }),
  toggleFavorite: (id) => set(state => ({ favorites: state.favorites.includes(id) ? state.favorites.filter(item => item !== id) : [...state.favorites,id] })),
  setSearchOpen: (value) => set({ searchOpen:value }), setInfoOpen: (value) => set({ infoOpen:value }),
  setTimeRate: (value) => set({ timeRate:value }), setShowOrbits: (value) => set({ showOrbits:value }),
  setAutoTour: (value) => set({ autoTour:value, cameraMode:value ? 'tour' : 'orbit' }),
  setCameraMode: (mode) => set({ cameraMode:mode, autoTour:mode === 'tour' }),
}), { name:'astraeon-preferences', partialize: (state) => ({ favorites:state.favorites, showOrbits:state.showOrbits, timeRate:state.timeRate }) }))
