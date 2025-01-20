import { useState } from "preact/hooks";
import ErrorTooltip from "../Modal/ErrorTooltip";
import { actions } from "astro:actions";

export default function EditableField({ userID, field, label, type, value }) {
    const [fieldValue, setFieldValue] = useState(value);
    const [hasChanges, setHasChanges] = useState(false);
    const [errors, setErrors] = useState({}); // Estado de erros

    const handleInputChange = async (e) => {
        try {
            const newValue = e.target.value;
            setFieldValue(newValue);
            setHasChanges(true);

            console.log("userID, field, newValue: ", field, newValue)

            const { data, error } = await actions.validateUserField({ field, value: newValue });

            if (error || !data.valid) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    [`${userId}-${field}`]: data?.message || error?.message || "Validation error",
                }));
            }

            console.log("error: ", error)

            //const validationError = await validateField(id, newValue);
            setErrors(error);

        } catch (err) {
            console.error("Erro ao processar alteração:", err);
        }
    };

    const handleSave = async () => {
        try {
            console.log("fieldValue: ", fieldValue)
            //await saveField(userID, fieldValue);
            const { error } = await actions.editUser({ id: String(userID), [field]: fieldValue });
            if (error) {
                throw new Error("Erro ao salvar.");
            }

            setHasChanges(false);
            setErrors(null);
        } catch (err) {
            console.error("Erro ao salvar o campo:", err);
        }
    };

    return (
        <div className="flex items-center gap-4">
            <label htmlFor={userID} className="text-sm font-bold text-gray-700">
                {label}
            </label>

            <div className="w-full relative">
                {type !== "password" ? (
                    <input
                        name={field}
                        type={type}
                        value={fieldValue}
                        onInput={handleInputChange}
                        className={`rounded-md border-gray-300 shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 ${error ? "border-red-500" : ""
                            }`}
                    />
                ) : (
                    <div className="relative flex items-center gap-4">
                        <input
                            name={field}
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
                    className=""
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
                        className="w-full icon"
                    >
                        <path
                            stroke="none"
                            d="M0 0h24v24H0z"
                            fill="none"
                        />
                        <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
                        <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
                    </svg>
                </button>
            )}
        </div>
    );
}
