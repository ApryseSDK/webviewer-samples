export const isURLAbsolute = (url: string): boolean => {
  return url.indexOf('://') > 0 || url.indexOf('//') === 0;
};

export const getCorrectHref = (url: string): string => {
  if (url.indexOf('//') === 0) {
    return `https:${url}`;
  }
  return url;
};