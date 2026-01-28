// Client-side configuration loader
// This module loads the config.json file and makes it available to client-side

// Preload config for faster access
export async function preloadConfig() {
  if (configData) {
    return configData;
  }

  try {
    const response = await fetch('/config/config.json');
    if (!response.ok)
      throw new Error(`Failed to load configuration: ${response.statusText}`);

    configData = await response.json();
    return configData;
  } catch (error) {
    console.error('Error loading configuration:', error);
    throw error;
  }
}