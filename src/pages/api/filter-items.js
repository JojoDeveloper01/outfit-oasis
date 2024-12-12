import { filterItems } from '@lib/dbFunctions';

export async function POST({ request }) {
    try {
        const filters = await request.json();
        const items = await filterItems(filters);
        console.log("items: ", items)

        return new Response(JSON.stringify(items), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Erro ao processar os filtros:', error);
        return new Response('Erro ao processar os filtros', { status: 500 });
    }
}
