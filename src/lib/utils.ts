import { writeFile, mkdir } from "fs/promises";
import fs from "fs/promises";
import path from "path";

export async function saveFileToPublic(file: File, name: string, type: string): Promise<string> {
    try {
        const pathType = (type === "profile") ? "/profile_users" : "/items_images";

        // Garante que a pasta public/profile_users existe
        const uploadDir = path.join(process.cwd(), `public/${pathType}`);
        await mkdir(uploadDir, { recursive: true });

        // Gera o nome do ficheiro: "profile_nome-do-user.extensão" ou "item_nome-do-item.extensão"
        const fileExtension = path.extname(file.name);
        const sanitizedFileName = sanitizeName(name);
        const fileName = `${type}_${sanitizedFileName}${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);

        // Salva o ficheiro no diretório
        await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

        // Retorna o caminho relativo
        return `${pathType}/${fileName}`;
    } catch (error: any) {
        console.error("Erro ao salvar o ficheiro:", error);
        throw new Error(`Falha ao salvar o ficheiro: ${error.message}`);
    }
}

//delete the images when the item or user is deleted
export async function deleteImage(imagePath: string): Promise<void> {
    try {
        // Construct the absolute path to the file
        const filePath = path.join(process.cwd(), "public", imagePath.replace(/^\/+/, ""));

        // Log the resolved path for debugging
        //console.log(`Resolved file path: ${filePath}`);

        // Check if the file exists
        await fs.access(filePath);

        // Delete the file
        await fs.unlink(filePath);

        //console.log(`Image successfully deleted: ${filePath}`);
    } catch (error: any) {
        if (error.code === "ENOENT") {
            console.warn(`Image not found: ${imagePath}`);
            return; // Do not throw an error if the file does not exist
        }

        console.error("Error deleting the image:", error);
        throw new Error(`Failed to delete the image: ${error.message}`);
    }
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