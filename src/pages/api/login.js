import { getUserLogin } from "@lib/dbFunctions";

export async function POST({ request }) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return new Response(JSON.stringify({ success: false, message: "Email e senha são obrigatórios." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const user = await getUserLogin(email, password);

    //console.log("User: ", user)

    if (user.length > 0) {
      // Login bem-sucedido, retorna os dados do usuário
      return new Response(JSON.stringify({ success: true, user: user }), {
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
    console.error("Erro ao processar login:", error);
    return new Response(JSON.stringify({ success: false, message: "Erro no servidor." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}