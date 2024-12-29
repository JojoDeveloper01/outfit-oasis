import { useState, useEffect } from "preact/hooks";
import Delete from "../Modal/Delete";
import PreviewImage from "../Modal/PreviewImage";
import ErrorTooltip from "../ErrorTooltip";
import { actions } from "astro:actions";

function sanitizeName(name) {
    if (!name) return "";
    return name
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "")
        .toLowerCase();
}

export default function UserTable({ users }) {
    const [data, setData] = useState(users); // Estado dos usuários
    const [errors, setErrors] = useState({}); // Estado de erros
    const [originalValues, setOriginalValues] = useState({}); // Para valores originais

    // Sincronizar `data` e `originalValues` com `users`
    useEffect(() => {
        setData(users);
        setOriginalValues(
            users.reduce((acc, user) => {
                acc[user.user_id] = { ...user };
                return acc;
            }, {})
        );
    }, [users]);

    // Função para remover um usuário do estado
    const handleDelete = (userId) => {
        setData((prevData) => prevData.filter((user) => user.user_id !== userId));
    };

    // Atualizar valor de um campo
    const handleFieldChange = async (event, userId, field) => {
        const value = event.target.value.trim();

        setData((prevData) =>
            prevData.map((user) =>
                user.user_id === userId ? { ...user, [field]: value } : user
            )
        );

        try {
            const { data, error } = await actions.validateField({
                field,
                id: String(userId),
                value,
            });

            if (error || !data.valid) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    [`${userId}-${field}`]: data?.message || error?.message || "Validation error",
                }));
            } else {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    [`${userId}-${field}`]: null,
                }));
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            setErrors((prevErrors) => ({
                ...prevErrors,
                [`${userId}-${field}`]: "An unexpected error occurred.",
            }));
        }

    };

    // Salvar o valor no backend
    const handleSave = async (userId, field) => {
        const value = data.find((user) => user.user_id === userId)?.[field];

        try {
            const { error } = await actions.editUser({ id: String(userId), [field]: value });

            if (error) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    [`${userId}-${field}`]: error.message,
                }));
            } else {
                setOriginalValues((prevOriginals) => ({
                    ...prevOriginals,
                    [userId]: { ...prevOriginals[userId], [field]: value },
                }));
            }
        } catch (err) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                [`${userId}-${field}`]: "An unexpected error occurred.",
            }));
        }
    };

    return (
        <div class="mt-4">
            {/* Tabela de usuários */}
            <table class="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead class="bg-gray-50">
                    <tr class="*:py-2 *:px-4 *:text-left *:text-sm *:font-semibold *:text-gray-600 *:border-b *:border-gray-200">
                        <th>Profile Picture</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>User Type</th>
                        <th>Phone</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    {data.map((user) => (
                        <tr key={user.user_id} class="hover:bg-gray-100">
                            {/* MODALS PARA CADA USER */}
                            <PreviewImage src={user.profile_pic} />
                            <Delete id={user.user_id} name_user={sanitizeName(user.name)} onDelete={handleDelete} />
                            {/* MODALS PARA CADA USER */}

                            <td class="py-3 px-4">
                                <img
                                    onClick={() =>
                                        document.getElementById(
                                            `preview-profile-image-${user.profile_pic}`
                                        ).showModal()
                                    }
                                    src={user.profile_pic}
                                    alt="Profile"
                                    class="h-10 w-10 rounded-full object-cover cursor-pointer"
                                />
                            </td>

                            {["name", "email", "user_type", "phone"].map(
                                (field) => (
                                    <td
                                        key={`${user.user_id}-${field}`}
                                        class="py-3 px-4 text-sm text-gray-600 relative"
                                    >
                                        <div class="flex items-stretch gap-2 min-w-32 max-w-64">
                                            {/* Campo editável */}
                                            <div class="w-4/5 *:m-0">
                                                {field === "user_type" ? (
                                                    <select
                                                        value={user[field] || ""}
                                                        class={`${errors[
                                                            `${user.user_id}-${field}`
                                                        ]
                                                            ? "border-red-500"
                                                            : ""
                                                            }`}
                                                        onChange={(e) =>
                                                            handleFieldChange(
                                                                e,
                                                                user.user_id,
                                                                field
                                                            )
                                                        }
                                                    >
                                                        <option value="client">
                                                            Client
                                                        </option>
                                                        <option value="staff">
                                                            Staff
                                                        </option>
                                                    </select>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={user[field] || ""}
                                                        class={`${errors[
                                                            `${user.user_id}-${field}`
                                                        ]
                                                            ? "border-red-500"
                                                            : ""
                                                            }`}
                                                        placeholder={`Enter ${field}`}
                                                        onInput={(e) =>
                                                            handleFieldChange(
                                                                e,
                                                                user.user_id,
                                                                field
                                                            )
                                                        }
                                                    />
                                                )}
                                            </div>
                                            {/* Botão salvar */}
                                            <div class="w-1/5 *:h-full">
                                                {!errors[`${user.user_id}-${field}`] &&
                                                    originalValues[user.user_id] && // Garante que `originalValues` existe
                                                    user[field] !==
                                                    originalValues[user.user_id][field] && (
                                                        <button
                                                            onClick={() =>
                                                                handleSave(user.user_id, field)
                                                            }
                                                            class="save-button"
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
                                                                class="w-full icon"
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

                                            {/* Tooltip de erro */}
                                            {
                                                errors[`${user.user_id}-${field}`] && (
                                                    <ErrorTooltip
                                                        id={`${user.user_id}-${field}`}
                                                        message={errors[`${user.user_id}-${field}`]}
                                                    />
                                                )
                                            }
                                        </div>
                                    </td>
                                )
                            )}

                            <td>
                                <button
                                    onClick={() => document.getElementById(`delete-${sanitizeName(user.name)}-${user.user_id}`).showModal()}
                                    class="bg-red-500 text-white px-2 py-1 mr-4 rounded-md hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table >
        </div >
    );
}
