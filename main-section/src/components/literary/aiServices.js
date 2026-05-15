export const AI_SERVICES = [
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    urlTemplate: (prompt) => `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`,
    favicon: 'https://www.google.com/s2/favicons?domain=chatgpt.com&sz=32',
  },
  {
    id: 'gemini',
    label: 'Gemini',
    urlTemplate: (prompt) => `https://gemini.google.com/app?q=${encodeURIComponent(prompt)}`,
    favicon: 'https://www.google.com/s2/favicons?domain=gemini.google.com&sz=32',
  },
  {
    id: 'claude',
    label: 'Claude',
    urlTemplate: (prompt) => `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
    favicon: 'https://www.google.com/s2/favicons?domain=claude.ai&sz=32',
  },
];
