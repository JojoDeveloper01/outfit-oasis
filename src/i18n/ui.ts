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
        'nav.clothes': 'clothes',
        'nav.analytics': 'analytics',
        'nav.users': 'users',
        'nav.items': 'items',
        'nav.historical': 'historical',
        'nav.logout': 'logout',
    },
    pt: {
        'nav.home': 'início',
        'nav.dashboard': 'painel',
        'nav.clothes': 'roupa',
        'nav.analytics': 'analiticas',
        'nav.users': 'utilizadores',
        'nav.items': 'artigos',
        'nav.historical': 'historico',
        'nav.logout': 'sair',
    },
    es: {
        'nav.home': 'inicio',
        'nav.dashboard': 'panel',
        'nav.clothes': 'ropa',
        'nav.analytics': 'analiticas',
        'nav.users': 'usuarios',
        'nav.items': 'articulos',
        'nav.historical': 'historico',
        'nav.logout': 'salir',
    },
} as const;

/* export const routes = {
    en: {
        'dashboard': 'dashboard',
        'clothes': 'clothes',
    },
    pt: {
        'dashboard': 'painel',
        'clothes': 'inventario',
    },
    es: {
        'dashboard': 'panel',
        'clothes': 'inventario',
    },
} */