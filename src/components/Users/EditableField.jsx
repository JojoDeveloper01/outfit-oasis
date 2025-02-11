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
        <div className="w-[70%] flex items-center gap-[2vw]">
            <label htmlFor={`${userID}-${field}`} className="w-20 text-[1vw] font-bold text-gray-300">
                {name}
            </label>

            <div className="w-full relative">
                {type === "password" ? (
                    // Campo de Senha
                    <div className="relative flex items-center gap-[.7vw]">
                        <input
                            id={`${userID}-${field}`}
                            name={field}
                            type={isPasswordVisible ? "text" : "password"}
                            value={fieldValue}
                            onInput={handleInputChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            style="margin:0"
                            className={`rounded-md border-gray-300 shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 ${errors[`${userID}-${field}`] ? "border-red-500" : ""
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                            className="absolute right-1 mt-1 text-gray-500 hover:text-black"
                        >
                            {isPasswordVisible ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    className="size-[1.5vw]"
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
                                    <path d="M21 9c-2.4 2.667 -5.4 4 -9 4c-3.6 0 -6.6 -1.333 -9 -4" />
                                    <path d="M3 15l2.5 -3.8" />
                                    <path d="M21 15l-2.5 -3.8" />
                                    <path d="M9 17l.5 -4" />
                                    <path d="M15 17l-.5 -4" />
                                </svg>
                            )}
                        </button>
                    </div>
                ) : type === "file" ? (
                    // Campo de Arquivo
                    <div className="flex items-center gap-[1vw]">
                        <PreviewImage
                            src={fieldValue}
                            type="account"
                        />
                        <img
                            onClick={() => document.getElementById(`preview-account-image-${fieldValue}`).showModal()}
                            src={value}
                            alt={field}
                            class="size-[3vw] rounded-full border border-gray-300 cursor-pointer object-cover"
                        />
                        <input
                            id={`${userID}-${field}`}
                            name={field}
                            type={type}
                            onChange={(e) => {
                                const file = e.target.files[0]; // Obtém o primeiro arquivo selecionado
                                if (file) {
                                    setFieldValue(file); // Atualiza o estado com o arquivo
                                }
                            }}
                            accept="image/*" // Aceita apenas imagens
                            className={`block w-full text-[.5vw] text-gray-700 file:mr-[1vw] file:py-[.6vw] file:px-[1vw] file:rounded-full file:border-0 file:bg-[--gold] file:text-white hover:file:bg-[--gold]-700 ${errors[`${userID}-${field}`] ? "border-red-500" : ""
                                }`}
                        />
                    </div>
                ) : (
                    // Outros Tipos de Input
                    <input
                        id={`${userID}-${field}`}
                        name={field}
                        type={type}
                        value={fieldValue}
                        onInput={handleInputChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        style="margin:0"
                        className={`rounded-md border-gray-300 shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 ${errors[`${userID}-${field}`] ? "border-red-500" : ""
                            }`}
                    />
                )}

                {/* Error Tooltip */}
                {errors[`${userID}-${field}`] && isFocused && (
                    <ErrorTooltip
                        id={`${userID}-${field}`}
                        message={errors[`${userID}-${field}`]}
                    />
                )}
            </div>


            {fieldValue !== originalValue && !errors[`${userID}-${field}`] && (
                <button
                    onClick={handleSave}
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
