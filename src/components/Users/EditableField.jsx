/** components/EditableField.tsx */
import { useState } from "preact/hooks";
import ErrorTooltip from "../Modal/ErrorTooltip";


export default function EditableField({
    id,
    label,
    type,
    value,
    onSave,
    validateField,
}) {
    const [fieldValue, setFieldValue] = useState(value);
    const [hasChanges, setHasChanges] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = async (e) => {
        const newValue = e.target.value;
        setFieldValue(newValue);
        setHasChanges(true);

        // Valida o campo e atualiza o estado de erro
        const validationError = await validateField(id, newValue);
        setError(validationError);
    };

    const handleSave = async () => {
        try {
            await onSave(id, fieldValue);
            setHasChanges(false);
            setError(null);
        } catch (err) {
            console.error("Erro ao salvar:", err);
        }
    };

    return (
        <div className="flex items-center gap-4">
            <label htmlFor={id} className="text-sm font-bold text-gray-700">
                {label}
            </label>

            <div className="relative">
                {
                    type !== "password" ? (
                        // Campo normal (não senha)
                        <input
                            id={id}
                            type={type}
                            value={fieldValue}
                            onInput={handleInputChange}
                            className={`rounded-md border-gray-300 shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 ${error ? "border-red-500" : ""
                                }`}
                        />
                    ) : (
                        // Campo de senha com botão de mostrar/ocultar
                        <div
                            className="w-full relative flex gap-4 justify-between items-center"
                        >
                            <input
                                id={id}
                                type={type}
                                value={fieldValue}
                                onInput={handleInputChange}
                                className={`mt-1 w-full rounded-md border-gray-300 shadow-sm pr-10 text-gray-900 focus:border-blue-500 focus:ring-blue-500 ${error ? "border-red-500" : ""
                                    }`}
                            />
                            <button
                                type="button"
                                className="toggle-password absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 hover:text-black"
                                data-target={id}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 9c-2.4 2.667 -5.4 4 -9 4c-3.6 0 -6.6 -1.333 -9 -4" />
                                    <path d="M3 15l2.5 -3.8" />
                                    <path d="M21 15l-2.5 -3.8" />
                                    <path d="M9 17l.5 -4" />
                                    <path d="M15 17l-.5 -4" />
                                </svg>
                            </button>
                        </div>
                    )
                }
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
