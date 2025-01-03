import { userExistsByID } from "@lib/dbFunctions";

export async function POST({ request }) {
    const body = await request.json();
    const { id } = body;

    //console.log("id: ", id);

    try {
        const exists = await userExistsByID(id);

        if (exists) {
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } else {
            return new Response(JSON.stringify({ success: false, message: "The user doesn't exist." }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
    } catch (error) {
        console.error("Error when processing the user:", error);
        return new Response(JSON.stringify({ success: false, message: "Erro no servidor." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
