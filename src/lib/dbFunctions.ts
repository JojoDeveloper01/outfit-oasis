import { turso } from "@turso";

export let sessions = {};

export async function getItems() {
    const result = await turso.execute('SELECT * FROM articles WHERE availability = 1');
    console.log("result: ", result)
    return result.rows;
}

export async function addItem(
    name: string,
    type: string,
    category: string,
    size: string,
    color: string,
    brand: string,
    rental_price: string,
    condition: string,
) {
    const sql = `
        INSERT INTO articles (articles_name, category, size, type, color, brand, rental_price, condition) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await turso.execute({
        sql,
        args: [name, category, size, type, color, brand, rental_price, condition],
    });
    console.log("Add result: ", result);
    return result.rowsAffected; // Return number of rows affected
}

export async function editItem(
    id: number,
    name?: string,
    type?: string,
    category?: string,
    size?: string,
    color?: string,
    brand?: string,
    rental_price?: string,
    condition?: string
) {
    const updates = [];
    const args = [];

    if (name) {
        updates.push("articles_name = ?");
        args.push(name);
    }
    if (type) {
        updates.push("type = ?");
        args.push(type);
    }
    if (category) {
        updates.push("category = ?");
        args.push(category);
    }
    if (size) {
        updates.push("size = ?");
        args.push(size);
    }
    if (color) {
        updates.push("color = ?");
        args.push(color);
    }
    if (brand) {
        updates.push("brand = ?");
        args.push(brand);
    }
    if (rental_price) {
        updates.push("rental_price = ?");
        args.push(rental_price);
    }
    if (condition) {
        updates.push("condition = ?");
        args.push(condition);
    }

    args.push(id); // Add id as the last parameter

    const sql = `
        UPDATE articles 
        SET ${updates.join(", ")} 
        WHERE id = ?
    `;

    const result = await turso.execute({
        sql,
        args,
    });
    console.log("Edit result: ", result);
    return result.rowsAffected; // Return number of rows affected
}

export async function deleteItem(id: number) {
    const sql = `
        DELETE FROM articles 
        WHERE id = ?
    `;
    const result = await turso.execute({
        sql,
        args: [id],
    });
    console.log("Delete result: ", result);
    return result.rowsAffected; // Return number of rows affected
}

export async function registerUser(name: string, email: string, password: string) {
    const result = await turso.execute({
        sql: "INSERT INTO users (name, email, password, user_type) VALUES (?, ?, ?, 'client') RETURNING user_id;",
        args: [name, email, password]
    });
    console.log("result: ", result);
    const userId = result.rows[0]?.user_id; // Obtém o ID da resposta
    return { user_id: userId, email, name };
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