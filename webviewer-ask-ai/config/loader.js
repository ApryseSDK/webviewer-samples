// Client-side configuration loader
// This module loads the config.json file and makes it available to client-side

// Preload config for faster access
export async function preloadConfig() {
  if (globalThis.configData) {
    return globalThis.configData;
  }

  try {
    const response = await fetch('/config/config.json');
    if (!response.ok)
      throw new Error(`Failed to load configuration: ${response.statusText}`);

    globalThis.configData = await response.json();
    return globalThis.configData;
  } catch (error) {
    console.error('Error loading configuration:', error);
    throw error;
  }
}