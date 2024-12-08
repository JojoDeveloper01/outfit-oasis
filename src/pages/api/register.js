import { randomUUID } from "crypto";
import { registerUser, getUserByEmail, sessions } from "@lib/dbFunctions";
import fs from "fs/promises";

// Função para salvar sessões em um arquivo
async function saveSessionsToFile() {
    try {
        await fs.writeFile("src/lib/sessions.json", JSON.stringify(sessions, null, 2));
        console.log("Sessões salvas no arquivo.");
    } catch (error) {
        console.error("Erro ao salvar sessões no arquivo:", error);
    }
}

// Função para carregar sessões de um arquivo
async function loadSessionsFromFile() {
    try {
        const data = await fs.readFile("src/lib/sessions.json", "utf-8");
        return data.trim() ? JSON.parse(data) : {}; // Se vazio, retorna um objeto vazio
    } catch (error) {
        console.error("Erro ao carregar sessões:", error);
        return {}; // Retorna um objeto vazio se o arquivo não existir
    }
}

// Carrega as sessões ao iniciar o servidor
Object.assign(sessions, await loadSessionsFromFile());

export async function POST({ request }) {
    const body = await request.json();
    const { email, password, name } = body;

    console.log("body: ", body)


    if (!email || !password || !name) {
        return new Response(JSON.stringify({ success: false, message: "Dados incompletos." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        // Verifica se o usuário já está registrado no banco
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return new Response(JSON.stringify({ success: false, message: "Usuário já registrado." }), {
                status: 409,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Regista o novo usuário na base de dados
        const newUser = await registerUser(email, password, name);

        // Cria uma nova sessão para o usuário registrado
        const sessionId = randomUUID();
        sessions[sessionId] = {
            email: newUser.email,
            name: newUser.name,
            //userType: newUser.user_type || "user",
            createdAt: Date.now(),
        };

        // Salva sessões no arquivo
        await saveSessionsToFile();

        return new Response(JSON.stringify({ success: true, user: newUser }), {
            status: 201,
            headers: {
                "Set-Cookie": `session=${sessionId}; HttpOnly; Path=/; Max-Age=3600`, // 1 hora
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Erro ao registrar usuário:", error);
        return new Response(JSON.stringify({ success: false, message: "Erro no servidor." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
