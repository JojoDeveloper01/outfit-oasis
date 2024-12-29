import { useState, useEffect } from "preact/hooks";
import { actions } from "astro:actions";

const Delete = ({ name_user, id, onDelete }) => {
    const [isClient, setIsClient] = useState(false);
    const [error, setError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const deleteUser = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            // Chamada para o backend usando actions
            const { data, error } = await actions.deleteUser({ id: String(id) });

            if (error) {
                console.error("Delete failed:", error.message);
                setError(error.message || "An unexpected error occurred.");
                return;
            }

            //console.log(`User ${name_user} (ID: ${id}) deleted successfully.`);

            if (onDelete) onDelete(id);

            // Fechar o diálogo após a exclusão
            document.getElementById(`delete-${name_user}-${id}`)?.close();
        } catch (err) {
            console.error("Unexpected error:", err);
            setError("An unexpected error occurred.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isClient) return null;

    return (
        <dialog
            id={`delete-${name_user}-${id}`}
            className="backdrop:bg-black/50 shadow-lg max-w-md w-full m-auto p-4 text-red-800 border border-red-300 rounded-lg bg-red-50"
        >
            <div className="flex items-center mb-4">
                <h3 className="text-xl font-medium">
                    Are you sure you want to remove {name_user}?
                </h3>
            </div>

            {/* Mensagem de erro, se existir */}
            {error && (
                <div className="mb-4 text-red-700 bg-red-100 p-2 rounded">
                    {error}
                </div>
            )}

            <div className="flex">
                <button
                    onClick={deleteUser}
                    disabled={isDeleting}
                    className={`text-white bg-red-800 hover:bg-red-900 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-lg px-3 py-1.5 me-2 ${isDeleting ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                >
                    {isDeleting ? "Deleting..." : "Delete"}
                </button>
                <button
                    onClick={() =>
                        document.getElementById(`delete-${name_user}-${id}`)?.close()
                    }
                    className="text-red-800 bg-transparent border border-red-800 hover:bg-red-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-lg px-3 py-1.5"
                >
                    Cancel
                </button>
            </div>
        </dialog>
    );
};

export default Delete;

