import { useState } from "preact/hooks";
import ErrorTooltip from "../Modal/ErrorTooltip";
import { actions } from "astro:actions";

export default function EditableField({ id, label, type, value }) {
    const [fieldValue, setFieldValue] = useState(value);
    const [hasChanges, setHasChanges] = useState(false);
    const [error, setError] = useState(null);

    const validateField = async (id, value) => {
        try {
            const { data, error } = await actions.validateUserField({ id, field: id, value });
            if (error || !data?.valid) {
                return data?.message || "Erro de validação.";
            }
            return null;
        } catch (err) {
            console.error("Erro ao validar o campo:", err);
            return "Erro inesperado ao validar.";
        }
    };

    const saveField = async (id, value) => {
        try {
            const { error } = await actions.editUser({ id, [id]: value });
            if (error) {
                throw new Error("Erro ao salvar.");
            }
        } catch (err) {
            console.error("Erro ao salvar o campo:", err);
            throw new Error("Erro ao salvar os dados.");
        }
    };

    const handleInputChange = async (e) => {
        try {
            const newValue = e.target.value;
            setFieldValue(newValue);
            setHasChanges(true);

            const validationError = await validateField(id, newValue);
            setError(validationError);
        } catch (err) {
            console.error("Erro ao processar alteração:", err);
        }
    };

    const handleSave = async () => {
        try {
            await saveField(id, fieldValue);
            setHasChanges(false);
            setError(null);
        } catch (err) {
            console.error("Erro ao salvar o campo:", err);
        }
    };

    return (
        <div className="flex items-center gap-4">
            <label htmlFor={id} className="text-sm font-bold text-gray-700">
                {label}
            </label>

            <div className="relative">
                {type !== "password" ? (
                    <input
                        id={id}
                        type={type}
                        value={fieldValue}
                        onInput={handleInputChange}
                        className={`rounded-md border-gray-300 shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 ${error ? "border-red-500" : ""
                            }`}
                    />
                ) : (
                    <div className="relative flex items-center gap-4">
                        <input
                            id={id}
                            type={type}
                            value={fieldValue}
                            onInput={handleInputChange}
                            className={`rounded-md border-gray-300 shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 ${error ? "border-red-500" : ""
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() =>
                            (document.getElementById(id).type =
                                document.getElementById(id).type === "password" ? "text" : "password")
                            }
                            className="absolute inset-y-0 right-0 px-2 text-gray-500 hover:text-black"
                        >
                            {/* Icone para alternar */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path d="M21 9c-2.4 2.667 -5.4 4 -9 4c-3.6 0 -6.6 -1.333 -9 -4" />
                                <path d="M3 15l2.5 -3.8" />
                                <path d="M21 15l-2.5 -3.8" />
                                <path d="M9 17l.5 -4" />
                                <path d="M15 17l-.5 -4" />
                            </svg>
                        </button>
                    </div>
                )}
                {error && <ErrorTooltip message={error} />}
            </div>

            {hasChanges && !error && (
                <button
                    onClick={handleSave}
                    className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded"
                >
                    Salvar
                </button>
            )}
        </div>
    );
}
