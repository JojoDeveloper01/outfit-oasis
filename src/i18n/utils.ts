import { ui, defaultLang, showDefaultLang, languages } from './ui';

export function getLangFromUrl(url: URL) {
    const [, lang] = url.pathname.split('/');
    if (lang in ui) return lang as keyof typeof ui;
    return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
    return function t(key: keyof typeof ui[typeof defaultLang]) {
        return ui[lang][key] || ui[defaultLang][key];
    };
}

/* export function useTranslatedPath(currentLang: keyof typeof ui) {
    return function translatePath(path: string, targetLang: string = currentLang) {
        const cleanPath = path.startsWith("/") ? path : `/${path}`;
        return targetLang === defaultLang ? cleanPath : `/${targetLang}${cleanPath}`;
    };
} */

export function useTranslatedPath(currentLang: keyof typeof languages) {
    return function translatePath(currentPath: string, targetLang: string = currentLang) {
        // Substitui o idioma atual pelo novo idioma
        const newPath = currentPath.replace(`/${currentLang}`, `/${targetLang}`);
        return newPath;
    };
}
