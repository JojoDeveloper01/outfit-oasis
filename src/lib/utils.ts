export async function fetchCountryInfo(countryName: string) {
    const response = await fetch(
        `https://restcountries.com/v3.1/name/${countryName}`,
    );
    if (!response.ok) {
        console.error("Erro ao buscar informações do país:", response.status);
        return null;
    }
    const data = await response.json();
    return {
        name: data[0]?.name?.common || "Unknown",
        flag: data[0]?.flags?.png || "",
    };
}

export async function fetchAllCountries(languages: Record<string, any>) {
    const countryPromises = Object.entries(languages).map(
        async ([code, { defaultCountry }]) => {
            const country = await fetchCountryInfo(defaultCountry);
            return { code, country };
        },
    );

    const countryData = await Promise.all(countryPromises);
    return countryData.reduce((acc: any, { code, country }) => {
        if (country) acc[code] = country;
        return acc;
    }, {});
}

export async function loadDataWithFallback<T>(
    fetchData: () => Promise<T>,
    fallback: T,
): Promise<T> {
    try {
        return await fetchData();
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        return fallback;
    }
}