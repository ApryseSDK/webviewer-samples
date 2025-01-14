import { IconButton } from '@pdftron/webviewer-react-toolkit';
import React, { useLayoutEffect, useRef, useState } from 'react';

export function ThemeButton() {
  const html = useRef(document.documentElement);

  const [darkTheme, setDarkTheme] = useState(() => localStorage.getItem('data-theme') === 'dark');

  useLayoutEffect(() => {
    const newTheme = darkTheme ? 'dark' : '';
    html.current.setAttribute('data-theme', newTheme);
    setTimeout(() => localStorage.setItem('data-theme', newTheme));
  }, [darkTheme]);

  return (
    <IconButton onClick={() => setDarkTheme(t => !t)} title={`Change to ${darkTheme ? 'light' : 'dark'} theme`}>
      {darkTheme ? '☀️' : '🌙'}
    </IconButton>
  );
}
