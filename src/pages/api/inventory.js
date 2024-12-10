import { getItems } from '@lib/dbFunctions';

export const GET = async () => {
    try {
        const items = await getItems();

        return new Response(JSON.stringify(items), {
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
