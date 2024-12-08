import { turso } from "@turso";

export let sessions = {};

export async function getInventory() {
    const result = await turso.execute('SELECT * FROM articles');
    return result.rows[0];
}

export async function registerUser(name: string, email: string, password: string) {
    const result = await turso.execute({
        sql: "INSERT INTO users (name, email, password, user_type) VALUES (?, ?, ?, 'client') RETURNING id;",
        args: [name, email, password]
    });
    console.log("result: ", result);
    const userId = result.rows[0]?.user_id; // Obtém o ID da resposta
    return { id: userId, email, name };
}

export async function getUserLogin(email: string, password: string) {
    const result = await turso.execute({
        sql: "SELECT user_id, name, email, user_type, phone FROM users WHERE email = ? AND password = ?",
        args: [email, password]
    }
    );

    return result.rows[0];
}

// Verifica se um email já está registrado
export async function getUserByEmail(email: string) {
    const result = await turso.execute({
        sql: `SELECT * FROM users WHERE email = ?`,
        args: [email],
    });
    return result.rows[0] || null; // Retorna o usuário ou null se não encontrado
}

export async function userExistsByID(id: string): Promise<any | null> {
    const result = await turso.execute({
        sql: `SELECT user_id, name, email, user_type, phone FROM users WHERE user_id = ? LIMIT 1`,
        args: [id],
    });
    return result.rows[0] || null;
}
