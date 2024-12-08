export const languages = {
    en: { label: 'English' },
    pt: { label: 'Português' },
    es: { label: 'Español' },
};

export const defaultLang = 'en';
export const showDefaultLang = 'true'

export const ui = {
    en: {
        'nav.home': 'home',
        'nav.dashboard': 'dashboard',
        'nav.inventory': 'inventory',
        'nav.analytics': 'analytics',
        'nav.users': 'users',
        'nav.articles': 'articles',
        'nav.inbox': 'inbox',
        'nav.historical': 'historical',
        'nav.logout': 'logout',
    },
    pt: {
        'nav.home': 'início',
        'nav.dashboard': 'painel',
        'nav.inventory': 'inventario',
        'nav.analytics': 'analiticas',
        'nav.users': 'utilizadores',
        'nav.articles': 'artigos',
        'nav.inbox': 'caixa de entrada',
        'nav.historical': 'historico',
        'nav.logout': 'sair',
    },
    es: {
        'nav.home': 'inicio',
        'nav.dashboard': 'panel',
        'nav.inventory': 'inventario',
        'nav.analytics': 'analiticas',
        'nav.users': 'usuarios',
        'nav.articles': 'articulos',
        'nav.inbox': 'bandeja de entrada',
        'nav.historical': 'historico',
        'nav.logout': 'salir',
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