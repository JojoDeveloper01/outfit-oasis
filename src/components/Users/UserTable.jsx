import { useState, useEffect } from "preact/hooks";
import Delete from "../Modal/Delete";
import PreviewImage from "../Modal/PreviewImage";
import ErrorTooltip from "../Modal/ErrorTooltip";
import { actions } from "astro:actions";
import { sanitizeName } from "@lib/functions"

/* function sanitizeName(name) {
    if (!name) return "";
    return name
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "")
        .toLowerCase();
} */

export default function UserTable({ users, activeFilters, userType }) {
    const [data, setData] = useState(users); // Estado dos usuários
    const [errors, setErrors] = useState({}); // Estado de erros
    const [originalValues, setOriginalValues] = useState({}); // Para valores originais

    // Sincronizar `data` e `originalValues` com `users`
    useEffect(() => {
        setData(users);
        setOriginalValues(
            users.reduce((acc, user) => {
                acc[user.id] = { ...user };
                return acc;
            }, {})
        );
    }, [users]);

    function highlightMatch(field, value) {
        if (activeFilters[field]) {
            // Verifica correspondência parcial (para texto)
            if (typeof value === "string" || typeof value === "number") {
                return String(value)
                    .toLowerCase()
                    .includes(String(activeFilters[field]).toLowerCase());
            }
            // Verifica correspondência exata (para dropdowns)
            return value === activeFilters[field];
        }
        return false;
    }

    // Função para remover um usuário do estado
    const handleDelete = (userId) => {
        setData((prevData) => prevData.filter((user) => user.id !== userId));
    };

    // Atualizar valor de um campo
    const handleFieldChange = async (event, userId, field) => {
        const value = event.target.value.trim();

        setData((prevData) =>
            prevData.map((user) =>
                user.id === userId ? { ...user, [field]: value } : user
            )
        );

        try {
            const { data, error } = await actions.validateUserField({
                field,
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
        const value = data.find((user) => user.id === userId)?.[field];

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
        <div>
            {/* Cabeçalho */}
            <div className="bg-gray-50 p-[1vw] rounded-t-lg grid grid-cols-5 gap-[1vw] text-[1vw] font-semibold text-gray-600">
                <div>Profile Picture</div>
                <div>Name</div>
                <div>Email</div>
                <div>User Type</div>
                <div>Phone</div>
                {userType === 'staff' && <div></div>}
            </div>

            {/* Lista de usuários */}
            <div className=" divide-y divide-gray-200 rounded-b-lg">
                {data.length === 0 ? (
                    <div className="py-[.8vw] px-[1vw]">No Users available.</div>
                ) : (
                    data.map((user) => (
                        <div key={user.id} className="hover:bg-gray-100 p-[1vw] grid grid-cols-5 gap-[1vw] items-center">
                            {/* Profile Picture */}
                            <div className="flex items-center justify-center w-12">
                                <PreviewImage src={user.profile_pic} type="profile" />
                                <img
                                    onClick={() =>
                                        document.getElementById(
                                            `preview-profile-image-${user.profile_pic}`
                                        ).showModal()
                                    }
                                    src={user.profile_pic}
                                    alt="Profile"
                                    className="h-10 w-10 rounded-full object-cover cursor-pointer"
                                />
                            </div>

                            {/* Name, Email, User Type, Phone */}
                            {["name", "email", "user_type", "phone"].map((field) => (
                                <div key={`${user.id}-${field}`} className="text-[1vw] text-gray-600">
                                    <div className="relative flex items-stretch gap-[.7vw] min-w-32 max-w-64">
                                        {/* Campo editável */}
                                        <div className="w-4/5 *:m-0">
                                            {field === "user_type" && userType === "staff" ? (
                                                <select
                                                    value={user[field] || ""}
                                                    className={`w-full ${highlightMatch(field, user[field] || "") ? "ring-2 ring-yellow-500" : ""} ${errors[`${user.id}-${field}`] ? "border-red-500" : ""}`}
                                                    onChange={(e) => handleFieldChange(e, user.id, field)}
                                                >
                                                    <option value="client">Client</option>
                                                    <option value="staff">Staff</option>
                                                </select>
                                            ) : userType === "staff" ? (
                                                <input
                                                    type="text"
                                                    value={user[field] || ""}
                                                    className={`w-full ${highlightMatch(field, user[field] || "") ? "ring-2 ring-yellow-500" : ""} ${errors[`${user.id}-${field}`] ? "border-red-500" : ""}`}
                                                    placeholder={`Enter ${field.replace("_", " ")}`}
                                                    onInput={(e) => handleFieldChange(e, user.id, field)}
                                                />
                                            ) : (
                                                <p title={user[field] || ""}>
                                                    {user[field]?.length > 15 ? user[field].slice(0, 15) + "..." : user[field]}
                                                </p>
                                            )}
                                        </div>

                                        {/* Botão salvar */}
                                        <div className="w-1/5 *:h-full">
                                            {!errors[`${user.id}-${field}`] &&
                                                originalValues[user.id] && // Garante que `originalValues` existe
                                                user[field] !== originalValues[user.id][field] && (
                                                    <button onClick={() => handleSave(user.id, field)}>
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
                                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                            <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
                                                            <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
                                                        </svg>
                                                    </button>
                                                )}
                                        </div>

                                        {/* Error Tooltip */}
                                        {errors[`${user.id}-${field}`] && (
                                            <ErrorTooltip
                                                id={`${user.id}-${field}`}
                                                message={errors[`${user.id}-${field}`]}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Botão de deletar para staff */}
                            {userType === 'staff' && (
                                <div>
                                    <Delete id={user.id} name={sanitizeName(user.name)} imagePath={user.profile_pic} type="user" onDelete={handleDelete} />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
