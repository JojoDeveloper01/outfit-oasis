import { turso } from "@turso";

export async function getInventory() {
    const result = await turso.execute('SELECT * FROM articles');
    return result.rows;
}

export async function getUser(id_user: number) {
    const result = await turso.execute({
        sql: 'SELECT name, email, user_type, phone FROM users WHERE user_id = ?',
        args: [id_user],
    }
    );
    return result.rows;
}