import { useState } from "preact/hooks";
import ErrorTooltip from "../Modal/ErrorTooltip";
import { actions } from "astro:actions";

export default function EditableField({ userID, field, name, type, value }) {
    const [fieldValue, setFieldValue] = useState(value);
    const [hasChanges, setHasChanges] = useState(false);
    const [errors, setErrors] = useState({}); // Estado de erros
    const [isPasswordVisible, setIsPasswordVisible] = useState(false); // Alternância de senha

    const handleInputChange = async (e) => {
        const newValue = e.target.value.trim();
        setFieldValue(newValue);
        setHasChanges(true);

        try {
            const { data, error } = await actions.validateUserField({ field, value: newValue });

            if (error || !data.valid) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    [`${userID}-${field}`]: data?.message || error?.message || "Validation error",
                }));
            } else {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    [`${userID}-${field}`]: null,
                }));
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            setErrors((prevErrors) => ({
                ...prevErrors,
                [`${userID}-${field}`]: "An unexpected error occurred.",
            }));
        }
    };

    const handleSave = async () => {
        try {
            const { error } = await actions.editUser({
                id: String(userID),
                [field]: fieldValue,
            });

            if (error) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    [`${userID}-${field}`]: error.message,
                }));
            } else {
                setHasChanges(false); // Marca como salvo
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    [`${userID}-${field}`]: null,
                }));
            }
        } catch (err) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                [`${userID}-${field}`]: "An unexpected error occurred.",
            }));
        }
    };

    return (
        <div className="flex items-center gap-4">
            <label htmlFor={`${userID}-${field}`} className="text-sm font-bold text-gray-700">
                {name}
            </label>

            <div className="w-full relative">
                {type !== "password" ? (
                    <input
                        id={`${userID}-${field}`}
                        name={field}
                        type={type}
                        value={fieldValue}
                        onInput={handleInputChange}
                        className={`rounded-md border-gray-300 shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 ${errors[`${userID}-${field}`] ? "border-red-500" : ""
                            }`}
                    />
                ) : (
                    <div className="relative flex items-center gap-2">
                        <input
                            id={`${userID}-${field}`}
                            name={field}
                            type={isPasswordVisible ? "text" : "password"}
                            value={fieldValue}
                            onInput={handleInputChange}
                            className={`rounded-md border-gray-300 shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 ${errors[`${userID}-${field}`] ? "border-red-500" : ""
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                            className="text-gray-500 hover:text-black"
                        >
                            {isPasswordVisible ? (
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
                            ) : (
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
                                    <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                                    <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
                                </svg>
                            )}
                        </button>
                    </div>
                )}

                {/* Error Tooltip */}
                {errors[`${userID}-${field}`] && (
                    <ErrorTooltip
                        id={`${userID}-${field}`}
                        message={errors[`${userID}-${field}`]}
                    />
                )}
            </div>

            {hasChanges && !errors[`${userID}-${field}`] && (
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
