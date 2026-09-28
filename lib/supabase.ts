import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const supabaseUrl = 'https://dniboxvfvxezipswgedf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuaWJveHZmdnhlemlwc3dnZWRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1NDk4MzYsImV4cCI6MjEwNjEyNTgzNn0.EfudI-7y0b_wpnyWcDkT31sqF5cQefl2sABYzVw7qeE'

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

// expo-secure-store não funciona na web; lá usamos localStorage
const hasLocalStorage = typeof localStorage !== 'undefined'
const WebStorageAdapter = {
  getItem: async (key: string) => (hasLocalStorage ? localStorage.getItem(key) : null),
  setItem: async (key: string, value: string) => {
    if (hasLocalStorage) localStorage.setItem(key, value)
  },
  removeItem: async (key: string) => {
    if (hasLocalStorage) localStorage.removeItem(key)
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? WebStorageAdapter : ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
