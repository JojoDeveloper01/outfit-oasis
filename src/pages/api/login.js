import { randomUUID } from 'crypto';

const sessions = {}; // Simula um armazenamento de sessões (troque por um banco de dados em produção)

export async function post({ request }) {
  const body = await request.json();
  const { email, password } = body;

  // Substituir por autenticação real (ex.: banco de dados)
  if (email === "user@example.com" && password === "123456") {
    const sessionId = randomUUID();
    sessions[sessionId] = { email };

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Set-Cookie": `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=3600`, // 1 hora
        "Content-Type": "application/json",
      },
    });
  } else {
    return new Response(JSON.stringify({ success: false, message: "Credenciais inválidas" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}
