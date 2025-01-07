import { turso } from "@turso";

/* Items */

interface Item {
    name: string,
    type: string,
    category: string,
    size: string,
    color: string,
    brand: string,
    rental_price: string,
    condition: string,
    image: string,
}

export async function getItems() {
    const result = await turso.execute('SELECT * FROM articles ORDER BY added_date DESC');
    return result.rows;
}

export async function addItem(item: Item) {
    const result = await turso.execute({
        sql: 'INSERT INTO articles (name, type, category, size, color, brand, rental_price, condition, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [item.name, item.type, item.category, item.size, item.color, item.brand, item.rental_price, item.condition, item.image],
    });
    return result.rowsAffected;
}

export async function editItem(id: number, updates: Partial<Item>): Promise<boolean> {
    try {
        // Criar os campos dinâmicos para a query
        const fields = Object.entries(updates)
            .filter(([_, value]) => value !== undefined && value !== null) // Ignorar valores indefinidos ou nulos
            .map(([key, _]) => `${key} = ?`) // Mapear os campos para 'key = ?'
            .join(", ");

        const values = Object.values(updates).filter((value) => value !== undefined && value !== null);

        //console.log("values: ", values)

        // Verificar se há campos para atualizar
        if (fields.length === 0) {
            throw new Error("No valid fields provided to update.");
        }

        // Adicionar o ID no final dos valores
        values.push(id.toString());

        // Executar a query de atualização
        await turso.execute({
            sql: `UPDATE articles SET ${fields} WHERE id = ?`,
            args: values
        });

        return true; // Operação bem-sucedida
    } catch (error) {
        console.error("Error updating user:", error);
        return false; // Operação falhou
    }
}

export async function deleteItem(id: number) {
    const result = await turso.execute({
        sql: 'DELETE FROM articles WHERE id = ?',
        args: [id],
    });

    //console.log("Delete result: ", result);
    return result.rowsAffected;
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

export async function getItemByName(name: string) {
    const result = await turso.execute({
        sql: `SELECT * FROM articles WHERE name COLLATE NOCASE = ?`,
        args: [name],
    });
    return result.rows[0] || null; // Retorna o usuário ou null se não encontrado
}

export async function getItemByID(id: number) {
    const result = await turso.execute({
        sql: `SELECT * FROM articles WHERE id = ?`,
        args: [id],
    });
    return result.rows[0] || null; // Retorna o usuário ou null se não encontrado
}

export async function getEmailItemByID(id: number) {
    const result = await turso.execute({
        sql: `SELECT email FROM articles WHERE id = ?`,
        args: [id],
    });
    return result.rows[0] || null; // Retorna o usuário ou null se não encontrado
}

// Login and Regisyer

export async function registerUser(name: string, email: string, password: string) {
    const result = await turso.execute({
        sql: "INSERT INTO users (name, email, password, user_type) VALUES (?, ?, ?, 'client') RETURNING id;",
        args: [name, email, password]
    });
    const userId = result.rows[0]?.id; // Obtém o ID da resposta
    return { id: userId, email, name };
}

export async function getUserLogin(email: string, password: string) {
    const result = await turso.execute({
        sql: "SELECT id, name, email, user_type, phone FROM users WHERE email = ? AND password = ?",
        args: [email, password]
    }
    );

    return result.rows[0];
}

// Users

interface User {
    name: string,
    email: string,
    password: string,
    user_type: string,
    phone: number | null,
    profile_pic: string,
}

export async function getUsers(): Promise<User[]> {
    const result = await turso.execute(
        'SELECT id, name, email, user_type, phone, profile_pic FROM users ORDER BY registration_date DESC'
    );
    return result.rows as unknown as User[];
}

export async function addUser(user: User) {
    const result = await turso.execute({
        sql: 'INSERT INTO users (name, email, password, user_type, phone, profile_pic) VALUES (?, ?, ?, ?, ?, ?)',
        args: [user.name, user.email, user.password, user.user_type, user.phone, user.profile_pic],
    });
    return result.rowsAffected;
}

export async function editUser(id: number, updates: Partial<User>): Promise<boolean> {
    try {
        // Criar os campos dinâmicos para a query
        const fields = Object.entries(updates)
            .filter(([_, value]) => value !== undefined && value !== null) // Ignorar valores indefinidos ou nulos
            .map(([key, _]) => `${key} = ?`) // Mapear os campos para 'key = ?'
            .join(", ");

        const values = Object.values(updates).filter((value) => value !== undefined && value !== null);

        //console.log("values: ", values)

        // Verificar se há campos para atualizar
        if (fields.length === 0) {
            throw new Error("No valid fields provided to update.");
        }

        // Adicionar o ID no final dos valores
        values.push(id);

        // Executar a query de atualização
        await turso.execute({
            sql: `UPDATE users SET ${fields} WHERE id = ?`,
            args: values
        });

        return true; // Operação bem-sucedida
    } catch (error) {
        console.error("Error updating user:", error);
        return false; // Operação falhou
    }
}

export async function deleteUser(id: number) {
    const result = await turso.execute({
        sql: 'DELETE FROM users WHERE id = ?',
        args: [id],
    });
    //console.log("Delete result: ", result);
    return result.rowsAffected;
}

//Verify Users
export async function getUserByEmail(email: string) {
    const result = await turso.execute({
        sql: `SELECT * FROM users WHERE email = ?`,
        args: [email],
    });
    return result.rows[0] || null; // Retorna o usuário ou null se não encontrado
}

export async function getUserEmailById(id: number) {
    const result = await turso.execute({
        sql: `SELECT email FROM users WHERE id = ?`,
        args: [id],
    });
    console.log("user", result)
    return result.rows.length > 0 ? result.rows[0] : null;
}

export async function userExistsByID(id: string): Promise<any | null> {
    const result = await turso.execute({
        sql: `SELECT id, name, email, user_type, phone, profile_pic FROM users WHERE id = ? LIMIT 1`,
        args: [id],
    });
    return result.rows[0] || null;
}

export async function getFilteredUsers(search: string, type: string) {
    let query = `SELECT * FROM users WHERE 1=1`;
    const params: any[] = [];

    if (search) {
        query += ` AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR phone LIKE ?)`;
        params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`, `%${search}%`);
    }

    if (type) {
        query += ` AND user_type = ?`;
        params.push(type);
    }

    const result = await turso.execute({ sql: query, args: params });
    return result.rows;
}