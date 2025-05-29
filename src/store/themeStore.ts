import { create } from 'zustand';
import { ThemeState } from '../types';

export const useThemeStore = create<ThemeState>((set) => {
  // Check if user has a saved preference, otherwise use system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialDarkMode = savedTheme 
    ? savedTheme === 'dark' 
    : systemPrefersDark;

  // Apply the theme to the document
  if (initialDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  return {
    isDarkMode: initialDarkMode,
    toggleTheme: () => set((state) => {
      const newDarkMode = !state.isDarkMode;
      
      // Save preference to localStorage
      localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
      
      // Apply theme to document
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return { isDarkMode: newDarkMode };
    }),
  };
});