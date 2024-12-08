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