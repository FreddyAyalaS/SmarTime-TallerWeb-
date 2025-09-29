export const getUserProfile = async () => ({
  name: "Juan Pérez",
  username: "juanp",
  email: "juan@correo.com",
  career: "Ingeniería",
  birthDate: "2000-01-01",
});

export const updateUserProfile = async (data) => data;
export const updateProfilePicture = async (formData) => ({ success: true });
export const updateUserPreferences = async (prefs) => prefs;