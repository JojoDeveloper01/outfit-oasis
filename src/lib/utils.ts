import { turso } from "@turso";

export async function getInventory() {
    const result = await turso.execute('SELECT * FROM artigos');
    return result.rows;
}