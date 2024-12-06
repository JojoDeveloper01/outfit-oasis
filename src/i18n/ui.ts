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
    },
    pt: {
        'nav.home': 'Início',
        'nav.dashboard': 'Painel',
        'nav.inventory': 'Inventario',
    },
    es: {
        'nav.home': 'Inicio',
        'nav.dashboard': 'Panel',
        'nav.inventory': 'Inventario',
    },
} as const;

export const routes = {
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
}