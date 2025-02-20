import { useState, useEffect } from "preact/hooks";
import { actions } from "astro:actions";
import { useTranslations } from "@i18n/utils";


const Delete = ({ name, id, imagePath, type, onDelete, lang }) => {
    const [isClient, setIsClient] = useState(false);
    const [error, setError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const t = useTranslations(lang);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const remove = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            // Chamada para o backend usando actions

            const { error } = await actions.delete({ id, type, imagePath });

            if (error) {
                console.error("Delete failed:", error.message);
                setError(error.message || "An unexpected error occurred.");
                return;
            }

            //console.log(`remove ${name} (ID: ${id}) deleted successfully.`);

            if (onDelete) {
                onDelete(id);
            } else {
                window.location.reload();
            }

            // Fechar o diálogo após a exclusão
            document.getElementById(`delete-${name}-${id}`)?.close();
        } catch (err) {
            console.error("Unexpected error:", err);
            setError("An unexpected error occurred.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isClient) return null;

    return (
        <div>
            <button
                onClick={() => {
                    const deleteModal = document.getElementById(
                        `delete-${name}-${id}`
                    );
                    if (deleteModal) {
                        deleteModal.showModal();
                    }
                }}
                className="bg-red-500 text-[--color-white1] px-[.8vw] py-[.6vw] rounded-md hover:bg-red-600 text-[.7vw]"
            >
                {t("home.delete")}
            </button>
            <dialog
                id={`delete-${name}-${id}`}
                className="backdrop:bg-black/50 bg-[--gray] text-[--color-white1] shadow-lg max-w-[40vw] w-full m-auto p-[1vw] rounded-lg"
            >
                <div className="flex items-center mb-[1.5vw]">
                    <h3 className="text-[1.5vw] max-[768px]:text-[4vw] font-medium">
                        {t("home.deleteAlert")} {name}?
                    </h3>
                </div>

                {/* Mensagem de erro, se existir */}
                {error && (
                    <div className="mb-[1vw] text-red-700 bg-red-100 p-[.7vw] rounded">
                        {error}
                    </div>
                )}

                <div className="flex">
                    <button
                        onClick={remove}
                        disabled={isDeleting}
                        className={`text-white bg-red-800 hover:bg-red-900 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-[1.2vw] px-[.8vw] py-[.5vw] me-2 ${isDeleting ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    >
                        {isDeleting ? "Deleting..." : t("home.delete")}
                    </button>
                    <button
                        onClick={() =>
                            document.getElementById(`delete-${name}-${id}`)?.close()
                        }
                        className="bg-transparent border border-red-800 hover:bg-red-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-red-300  font-medium rounded-lg text-[1.2vw] px-[.8vw] py-[.5vw]"
                    >
                        {t("home.cancel")}
                    </button>
                </div>
            </dialog>
        </div>
    );
};

export default Delete;

