import PreviewImage from "@components/Modal/PreviewImage";
import { useState } from "preact/hooks";
import ErrorTooltip from "../Modal/ErrorTooltip";
import { actions } from "astro:actions";

export default function EditableField({ userID, field, name, type, value }) {
    const [fieldValue, setFieldValue] = useState(value);
    const [originalValue, setOriginalValue] = useState(value); // Valor original para comparação
    const [errors, setErrors] = useState({});
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleInputChange = async (e) => {
        const newValue = e.target.value.trim();
        setFieldValue(newValue);

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
            let action;
            //console.log("fieldValue", fieldValue);

            if (fieldValue instanceof File) {
                // Se o fieldValue for um arquivo, cria e envia como FormData
                const formData = new FormData();
                formData.append("id", String(userID));
                formData.append(field, fieldValue);

                action = actions.addProfilePic(formData); // Envia o FormData diretamente
            } else {
                // Caso contrário, envia como JSON normal
                action = actions.editUser({
                    id: String(userID),
                    [field]: fieldValue,
                });
            }

            const { error } = await action;

            if (error) {
                console.error("Error saving field:", error);
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    [`${userID}-${field}`]: error.message,
                }));
            } else {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    [`${userID}-${field}`]: null,
                }));
                setOriginalValue(fieldValue); // Atualiza o valor original após salvar
                if (fieldValue instanceof File) location.reload()
            }
        } catch (err) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                [`${userID}-${field}`]: "An unexpected error occurred.",
            }));
        }
    };

    return (
        <div className="w-full flex flex-col gap-2">
            <label htmlFor={`${userID}-${field}`} className="text-sm font-bold text-gray-300">
                {name}
            </label>

            <div className="relative w-full">
                {type === "password" ? (
                    <div className="relative flex items-center w-full">
                        <input
                            id={`${userID}-${field}`}
                            name={field}
                            type={isPasswordVisible ? "text" : "password"}
                            value={fieldValue}
                            onInput={handleInputChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className={`w-full rounded-md border border-gray-600 bg-gray-700 text-white p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors[`${userID}-${field}`] ? "border-red-500" : ""
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                            className="absolute right-3 text-gray-400 hover:text-white"
                        >
                            {isPasswordVisible ? "🙈" : "👁️"}
                        </button>
                    </div>
                ) : type === "file" ? (
                    <div className="flex items-center gap-4">
                        <PreviewImage src={fieldValue} type="account" />
                        <img
                            onClick={() => document.getElementById(`preview-account-image-${fieldValue}`).showModal()}
                            src={value}
                            alt={field}
                            className="w-12 h-12 rounded-full border border-gray-300 cursor-pointer object-cover"
                        />
                        <input
                            id={`${userID}-${field}`}
                            name={field}
                            type={type}
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setFieldValue(file);
                                }
                            }}
                            accept="image/*"
                            className="block w-full text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                        />
                    </div>
                ) : (
                    <input
                        id={`${userID}-${field}`}
                        name={field}
                        type={type}
                        value={fieldValue}
                        onInput={handleInputChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className={`w-full rounded-md border border-gray-600 bg-gray-700 text-white p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors[`${userID}-${field}`] ? "border-red-500" : ""
                            }`}
                    />
                )}

                {errors[`${userID}-${field}`] && isFocused && (
                    <ErrorTooltip id={`${userID}-${field}`} message={errors[`${userID}-${field}`]} />
                )}
            </div>

            {fieldValue !== originalValue && !errors[`${userID}-${field}`] && (
                <button
                    onClick={handleSave}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-md transition"
                >
                    Save
                </button>
            )}
        </div>
    );
}
