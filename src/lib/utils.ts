import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function saveFileToPublic(file: File, username: string): Promise<string> {
    // Garante que a pasta public/profile_users existe
    const uploadDir = path.join(process.cwd(), "public/profile_users");
    await mkdir(uploadDir, { recursive: true });

    // Gera o nome do ficheiro: "profile_nome-do-user.extensão"
    const fileExtension = path.extname(file.name);
    const fileName = `profile_${username.replace(/\s+/g, "-").toLowerCase()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Salva o ficheiro no diretório
    await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    // Retorna o caminho relativo
    return `/profile_users/${fileName}`;
}

export function sanitizeName(name: string | undefined): string {
    if (!name) return "";
    return name
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "")
        .toLowerCase()
}

export async function fetchCountryFlag(countryName: string): Promise<string | null> {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
        if (!response.ok) {
            console.error(`Erro ao buscar bandeira do país ${countryName}:`, response.status);
            return null;
        }
        const data = await response.json();
        return data[0]?.flags?.png || null; // Retorna diretamente o link da bandeira
    } catch (error) {
        console.error("Erro ao buscar bandeira:", error);
        return null;
    }
}

export async function fetchAllCountryFlags(languages: Record<string, any>): Promise<Record<string, string>> {
    try {
        const flagPromises = Object.entries(languages).map(
            async ([code, { defaultCountry }]) => {
                const flag = await fetchCountryFlag(defaultCountry);
                return { code, flag };
            },
        );

        const flagData = await Promise.all(flagPromises);
        return flagData.reduce((acc: Record<string, string>, { code, flag }) => {
            if (flag) acc[code] = flag;
            return acc;
        }, {});
    } catch (error) {
        console.error("Erro ao buscar bandeiras:", error);
        return {};
    }
}