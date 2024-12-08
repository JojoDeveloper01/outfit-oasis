import type { APIRoute } from 'astro';
import { fetchAllCountryFlags } from '@lib/utils';
import { languages } from '@i18n/ui';

export const GET: APIRoute = async () => {
    try {
        const allFlags = await fetchAllCountryFlags(languages);
        return new Response(JSON.stringify(allFlags), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Erro ao gerar bandeiras na API:', error);
        return new Response(JSON.stringify({ error: 'Erro interno no servidor' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};
