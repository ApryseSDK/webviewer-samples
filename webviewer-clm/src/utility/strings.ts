export const removeExtension = (filename: string) => {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) { // No extension found
    return filename;
  }
  return filename.substring(0, lastDotIndex);
}