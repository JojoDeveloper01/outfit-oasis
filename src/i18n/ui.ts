export const languages = {
    en: { label: 'English', defaultCountry: 'United States' },
    pt: { label: 'Português', defaultCountry: 'Portugal' },
    es: { label: 'Español', defaultCountry: 'Spain' },
};

export const defaultLang = 'en';
export const showDefaultLang = 'true'

export const ui = {
    en: {
        'nav.home': 'Home',
        'nav.dashboard': 'dashboard',
        'nav.inventory': 'Inventory',
        'nav.analytics': 'Analytics',
        'nav.users': 'Users',
        'nav.articles': 'articles',
        'nav.inbox': 'Inbox',
        'nav.historical': 'Historical',
    },
    pt: {
        'nav.home': 'Início',
        'nav.dashboard': 'Painel',
        'nav.inventory': 'Inventario',
        'nav.analytics': 'Analiticas',
        'nav.users': 'Utilizadores',
        'nav.articles': 'Artigos',
        'nav.inbox': 'Caixa de entrada',
        'nav.historical': 'Historico',
    },
    es: {
        'nav.home': 'Inicio',
        'nav.dashboard': 'Panel',
        'nav.inventory': 'Inventario',
        'nav.analytics': 'Analiticas',
        'nav.users': 'Usuarios',
        'nav.articles': 'Articulos',
        'nav.inbox': 'Bandeja de entrada',
        'nav.historical': 'Historico',
    },
} as const;

/* export const routes = {
    en: {
        'dashboard': 'dashboard',
        'Inventory': 'inventory',
    },
    pt: {
        'dashboard': 'painel',
        'Inventory': 'inventario',
    },
    es: {
        'dashboard': 'panel',
        'Inventory': 'inventario',
    },
} */