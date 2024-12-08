import { randomUUID } from "crypto";
import { getUserLogin, sessions } from "@lib/dbFunctions";
import fs from "fs/promises"; // Para manipulação de arquivos

// Função para salvar sessões em um arquivo
async function saveSessionsToFile() {
  try {
    await fs.writeFile("sessions.json", JSON.stringify(sessions, null, 2));
    console.log("Sessões salvas no arquivo.");
  } catch (error) {
    console.error("Erro ao salvar sessões no arquivo:", error);
  }
}

// Função para carregar sessões de um arquivo
async function loadSessionsFromFile() {
  try {
    const data = await fs.readFile("sessions.json", "utf-8");
    sessions = JSON.parse(data);
    console.log("Sessões carregadas do arquivo.");
  } catch (error) {
    console.error("Erro ao carregar sessões:", error);
    sessions = {}; // Reinicia sessões se o arquivo não existir ou estiver corrompido
  }
}

// Carrega as sessões ao iniciar o servidor
await loadSessionsFromFile();

export async function POST({ request }) {
  const body = await request.json();
  const { email, password } = body;

  console.log("sessions: ", sessions)

  try {
    // Consulta o banco de dados para verificar o usuário
    const user = await getUserLogin(email, password);

    if (user.length > 0) {
      // Usuário encontrado, cria uma sessão
      const sessionId = randomUUID();
      sessions[sessionId] = {
        email: user[0].email,
        name: user[0].name,
        userType: user[0].user_type,
        expiresAt: Date.now() + 1800 * 1000, // 30 minutos
      };

      // Salva sessões no arquivo após atualizar
      await saveSessionsToFile();

      return new Response(JSON.stringify({ success: true, user: user[0] }), {
        status: 200,
        headers: {
          "Set-Cookie": `session=${sessionId}; HttpOnly; Path=/; Max-Age=1800`, // 30 minutos
          "Content-Type": "application/json",
        },
      });
    } else {
      // Usuário não encontrado ou credenciais inválidas
      return new Response(JSON.stringify({ success: false, message: "Credenciais inválidas" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Erro ao verificar login:", error);
    return new Response(JSON.stringify({ success: false, message: "Erro no servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}