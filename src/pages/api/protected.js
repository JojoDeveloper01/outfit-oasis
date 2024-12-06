export async function get({ request }) {
    const cookies = Object.fromEntries(request.headers.get('cookie')?.split('; ').map(c => c.split('=')) || []);

    if (cookies.sessionId && sessions[cookies.sessionId]) {
        return new Response(JSON.stringify({ success: true, data: { email: sessions[cookies.sessionId].email } }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } else {
        return new Response(JSON.stringify({ success: false, message: "Sessão inválida" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }
}
