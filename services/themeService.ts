type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'lia_theme_preference';

/**
 * Obtém o tema atual do localStorage ou retorna 'light' como padrão
 */
export const getTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  
  // Verificar localStorage primeiro
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }
  
  // Fallback: verificar classe no HTML
  if (document.documentElement.classList.contains('dark')) {
    return 'dark';
  }
  if (document.documentElement.classList.contains('light')) {
    return 'light';
  }
  
  return 'light';
};

/**
 * Salva o tema no localStorage e aplica no documento
 */
export const setTheme = (theme: Theme): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);
};

/**
 * Alterna entre tema claro e escuro
 */
export const toggleTheme = (): Theme => {
  const currentTheme = getTheme();
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  return newTheme;
};

/**
 * Inicializa o tema ao carregar a página
 */
export const initTheme = (): void => {
  if (typeof window === 'undefined') return;
  
  const theme = getTheme();
  setTheme(theme);
};

