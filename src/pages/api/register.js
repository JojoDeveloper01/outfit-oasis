import { registerUser, getUserByEmail } from "@lib/dbFunctions";

export async function POST({ request }) {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
        return new Response(JSON.stringify({ success: false, message: "Todos os campos são obrigatórios." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        // Verifica se o usuário já está registrado
        const existingUser = await getUserByEmail(email);

        if (existingUser) {
            return new Response(JSON.stringify({ success: false, message: "Usuário já registrado." }), {
                status: 409,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Registra o novo usuário no banco de dados
        const newUser = await registerUser(email, password, name);

        return new Response(JSON.stringify({ success: true, user: newUser }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Erro ao registrar usuário:", error);
        return new Response(JSON.stringify({ success: false, message: "Erro no servidor." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
