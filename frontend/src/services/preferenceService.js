// src/services/preferenceService.js

let userPreferences = {
  antiProcrastination: false,
  notifications: true,
  suggestions: false,
  darkMode: false,
};

export const getUserPreferences = async () => {
  console.log('preferenceService: Obteniendo preferencias simuladas...');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...userPreferences });
    }, 500);
  });
};

export const updateUserPreferences = async (preferencesData) => {
  console.log('preferenceService: Actualizando preferencias simuladas con:', preferencesData);
  return new Promise((resolve) => {
    setTimeout(() => {
      userPreferences = { ...userPreferences, ...preferencesData };
      resolve({ message: 'Preferencias actualizadas correctamente.', preferences: { ...userPreferences } });
    }, 700);
  });
};
