export const sanitizeName = (text: string) => {
    const sanitizedText = text
        .replace(/[^a-z0-9]+/gi, '-') // Substitui caracteres especiais por '-'
        .replace(/^-+|-+$/g, '')      // Remove '-' do início ou fim
        .toLowerCase();

    return sanitizedText;
};

//obter cookie no cliente
export function getCookie(name: string) {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === name) {
            return decodeURIComponent(value);
        }
    }
    return null; // Retorna null se o cookie não for encontrado
}