import { getItems } from "@lib/dbFunctions";

export async function GET() {
    try {
        const items = await getItems();

        console.log("items: ", items)

        if (items.length > 0) {
            // Login bem-sucedido, retorna os dados do usuário
            return new Response(JSON.stringify({ success: true, items }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } else {
            // Credenciais inválidas
            return new Response(JSON.stringify({ success: false, message: "Credenciais inválidas." }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
    } catch (error) {
        console.error("Erro ao obter items:", error);
        return new Response(JSON.stringify({ success: false, message: "Erro no servidor." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}