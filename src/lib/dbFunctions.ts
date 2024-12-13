import { turso } from "@turso";

export async function getItems() {
    const result = await turso.execute('SELECT * FROM articles WHERE availability = 1 ORDER BY added_date DESC');
    return result.rows;
}

export async function filterItems(fields: Record<string, string>) {
    const conditions: string[] = [];
    const args: any[] = [];

    // Build SQL conditions based on non-empty fields
    for (const [key, value] of Object.entries(fields)) {
        if (value) {
            conditions.push(`${key} = ?`);
            args.push(value);
        }
    }

    // Construct the query
    const sql = conditions.length
        ? `SELECT * FROM articles WHERE ${conditions.join(" AND ")}`
        : `SELECT * FROM articles WHERE availability = 1`;

    try {
        const result = await turso.execute({
            sql,
            args,
        });
        return result.rows;
    } catch (error) {
        console.error("Error executing filterItems:", error);
        throw new Error("Failed to fetch items.");
    }
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
        INSERT INTO articles (article_name, category, size, type, color, brand, rental_price, condition) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await turso.execute({
        sql,
        args: [name, category, size, type, color, brand, rental_price, condition],
    });
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
): Promise<number> {
    // Collect fields to update
    const updates: string[] = [];
    const args: (string | number)[] = [];

    if (name) {
        updates.push("article_name = ?");
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

    // Ensure there are fields to update
    if (updates.length === 0) {
        throw new Error("No fields provided to update.");
    }

    // Add the ID at the end of the arguments array
    args.push(id);

    // Build the SQL query
    const sql = `
        UPDATE articles 
        SET ${updates.join(", ")}
        WHERE article_id = ?
    `;

    try {
        const result = await turso.execute({
            sql,
            args,
        });
        //console.log("Edit result:", result);
        return result.rowsAffected; // Return the number of rows affected
    } catch (error) {
        console.error("Error executing editItem:", error);
        throw new Error("Failed to update the item. Please try again.");
    }
}

export async function deleteItem(id: number) {
    const sql = `
        DELETE FROM articles 
        WHERE article_id = ?
    `;
    const result = await turso.execute({
        sql,
        args: [id],
    });
    //console.log("Delete result: ", result);
    return result.rowsAffected; // Return number of rows affected
}

export async function registerUser(name: string, email: string, password: string) {
    const result = await turso.execute({
        sql: "INSERT INTO users (name, email, password, user_type) VALUES (?, ?, ?, 'client') RETURNING user_id;",
        args: [name, email, password]
    });
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