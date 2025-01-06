export const sanitizeName = (text: string) => {
    const sanitizedText = text
        .replace(/[^a-z0-9]+/gi, '-') // Substitui caracteres especiais por '-'
        .replace(/^-+|-+$/g, '')      // Remove '-' do início ou fim
        .toLowerCase();

    console.log("Texto sanitizado:", sanitizedText);

    return sanitizedText;
};