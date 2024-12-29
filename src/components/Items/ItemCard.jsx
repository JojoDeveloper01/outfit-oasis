{/* <ul
    style="grid-template-columns: repeat(auto-fit, minmax(min(17rem, 100%), .29fr));"
    class="articles grid gap-4"
>
    {
        items.map((item: any) =>
            isStaff === "staff" ? (
                    <Delete id={item.article_id} name={item.article_name} deleteAction={null} />
                    <li
                            class="max-w-96 p-6 bg-white shadow-lg rounded-lg border-2 border-gray-300 flex flex-col"
                            data-item-id={item.article_id}
                        >
                            <div class="flex flex-col space-y-2">
                                <div class="grid gap-2 text-base text-gray-600 item-fields">
                                    <p class="font-medium">
                                        <span class="font-bold">Name</span>:{" "}
                                        <span class="value-field">
                                            {item.article_name}
                                        </span>
                                    </p>
                                    <p class="font-medium">
                                        <span class="font-bold">Type</span>:{" "}
                                        <span class="value-field">
                                            {item.type}
                                        </span>
                                    </p>
                                    <p class="font-medium">
                                        <span class="font-bold">Category</span>:{" "}
                                        <span class="value-field">
                                            {item.category}
                                        </span>
                                    </p>
                                    <p class="font-medium">
                                        <span class="font-bold">Size</span>:{" "}
                                        <span class="value-field">
                                            {item.size}
                                        </span>
                                    </p>
                                    <p class="font-medium">
                                        <span class="font-bold">Color</span>:{" "}
                                        <span class="value-field">
                                            {item.color}
                                        </span>
                                    </p>
                                    <p class="font-medium">
                                        <span class="font-bold">Brand</span>:{" "}
                                        <span class="value-field">
                                            {item.brand}
                                        </span>
                                    </p>
                                    <p class="font-medium">
                                        <span class="font-bold">
                                            Rental Price
                                        </span>
                                        :{" "}
                                        <span class="value-field">
                                            {item.rental_price}
                                        </span>
                                        €
                                    </p>
                                    <p class="font-medium">
                                        <span class="font-bold">Condition</span>
                                        :{" "}
                                        <span class="value-field">
                                            {item.condition}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div class="item-container">
                                <div
                                    id="edit-delete"
                                    class="flex justify-start space-x-4 mt-4"
                                >
                                    <button class="px-4 py-2 text-white bg-[--teal] rounded-full shadow-md hover:bg-[--color2] focus:outline-none edit-item">
                                        Edit
                                    </button>

                                    <button
                                        onclick={`document.getElementById('delete-${item.article_name}-${item.article_id}').showModal()`}
                                        id={`delete-${item.article_name}-${item.article_id}`}
                                        class="px-4 py-2 text-white bg-[--blush] rounded-full shadow-md hover:bg-[--color3] focus:outline-none"
                                    >
                                        Delete
                                    </button>
                                </div>

                                <div
                                    id="save-cancel"
                                    class="justify-start space-x-4 mt-4 hidden"
                                >
                                    <button class="px-4 py-2 text-white bg-[--teal] rounded-full shadow-md hover:bg-[--color2] focus:outline-none save-item">
                                        Save
                                    </button>
                                    <button class="px-4 py-2 text-white bg-[--blush] rounded-full shadow-md hover:bg-[--color3] focus:outline-none cancel-item">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                    </li>
            ) : (
                <li
                    class="max-w-96 p-6 bg-white shadow-lg rounded-lg border border-gray-200 flex flex-col space-y-4 transition-transform transform hover:scale-105"
                    data-item-id={item.article_id}
                >
                    <!-- Image or illustration -->
                    <div class="aspect-w-4 aspect-h-3 bg-gray-100 rounded-md overflow-hidden">
                        <img
                            src={item.image_url || 'placeholder.jpg'}
                            alt={item.article_name}
                            class="object-cover w-full h-full"
                        />
                    </div>

                    <!-- Title -->
                    <h3 class="text-lg font-bold text-gray-800">{item.article_name}</h3>

                    <!-- Item information -->
                    <div class="text-gray-600 space-y-2 text-sm">
                        <p>{item.type}</p>
                        <p>{item.category}</p>
                        <p>{item.size}</p>
                        <p>{item.color}</p>
                        <p>{item.brand}</p>
                        <p class="text-lg font-bold text-gray-800">
                            {item.rental_price} €
                        </p>
                        <p>{item.condition}</p>
                    </div>

                    <!-- Action button -->
                    <button
                        class="mt-4 bg-blue-500 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-blue-600 transition"
                    >
                        Rent Now
                    </button>
                </li>
            )
        )
    }
</ul> */}


import { useState, useEffect } from "preact/hooks";
import Delete from "../Modal/Delete";
import ErrorTooltip from "../ErrorTooltip";
import { actions } from "astro:actions";

export default function ItemCard({ items, isStaff }) {
    const [data, setData] = useState(items); // Estado dos itens
    const [errors, setErrors] = useState({}); // Estado de erros
    const [originalValues, setOriginalValues] = useState({}); // Valores originais dos itens

    // Sincronizar `data` e `originalValues` com `items`
    useEffect(() => {
        setData(items);
        setOriginalValues(
            items.reduce((acc, item) => {
                acc[item.article_id] = { ...item };
                return acc;
            }, {})
        );
    }, [items]);

    // Função para remover um item do estado
    const handleDelete = (itemId) => {
        setData((prevData) => prevData.filter((item) => item.article_id !== itemId));
    };

    // Atualizar valor de um campo
    const handleFieldChange = async (event, itemId, field) => {
        const value = event.target.value.trim();

        setData((prevData) =>
            prevData.map((item) =>
                item.article_id === itemId ? { ...item, [field]: value } : item
            )
        );

        try {
            const { data, error } = await actions.validateField({
                field,
                id: String(itemId),
                value,
            });

            if (error || !data.valid) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    [`${itemId}-${field}`]: data?.message || error?.message || "Validation error",
                }));
            } else {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    [`${itemId}-${field}`]: null,
                }));
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            setErrors((prevErrors) => ({
                ...prevErrors,
                [`${itemId}-${field}`]: "An unexpected error occurred.",
            }));
        }
    };

    // Salvar o valor no backend
    const handleSave = async (itemId, field) => {
        const value = data.find((item) => item.article_id === itemId)?.[field];

        try {
            const { error } = await actions.editItem({ id: String(itemId), [field]: value });

            if (error) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    [`${itemId}-${field}`]: error.message,
                }));
            } else {
                setOriginalValues((prevOriginals) => ({
                    ...prevOriginals,
                    [itemId]: { ...prevOriginals[itemId], [field]: value },
                }));
            }
        } catch (err) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                [`${itemId}-${field}`]: "An unexpected error occurred.",
            }));
        }
    };

    return (
        <ul
            style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(min(17rem, 100%), .29fr))",
            }}
            className="articles grid gap-4"
        >
            {data.map((item) => (
                <li
                    key={item.article_id}
                    className={`max-w-96 p-6 bg-white shadow-lg rounded-lg border-2 ${isStaff ? "border-gray-300" : "border-gray-200"
                        } flex flex-col`}
                >
                    <div className="flex flex-col space-y-2">
                        <div className="grid gap-2 text-base text-gray-600 item-fields">
                            {/* Campos editáveis */}
                            {["article_name", "type", "category", "size", "color", "brand", "rental_price", "condition"].map(
                                (field) => (
                                    <div key={`${item.article_id}-${field}`} className="relative">
                                        <span className="font-bold">{field.replace("_", " ")}</span>
                                        <input
                                            type="text"
                                            value={item[field] || ""}
                                            className={`border p-2 rounded ${errors[`${item.article_id}-${field}`] ? "border-red-500" : ""
                                                }`}
                                            placeholder={`Enter ${field}`}
                                            onChange={(e) =>
                                                handleFieldChange(e, item.article_id, field)
                                            }
                                        />
                                        {/* Botão salvar */}
                                        {originalValues[item.article_id]?.[field] !== item[field] &&
                                            !errors[`${item.article_id}-${field}`] && (
                                                <button
                                                    onClick={() => handleSave(item.article_id, field)}
                                                    className="ml-2 text-teal-500 hover:text-teal-700"
                                                >
                                                    Save
                                                </button>
                                            )}
                                        {/* Tooltip de erro */}
                                        {errors[`${item.article_id}-${field}`] && (
                                            <ErrorTooltip
                                                id={`${item.article_id}-${field}`}
                                                message={errors[`${item.article_id}-${field}`]}
                                            />
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                    {isStaff && (
                        <div className="item-container mt-4">
                            <div id="edit-delete" className="flex justify-start space-x-4">
                                {/* Botão editar (opcionalmente funcional) */}
                                <button className="px-4 py-2 text-white bg-teal-500 rounded-full shadow-md hover:bg-teal-600 focus:outline-none">
                                    Edit
                                </button>

                                {/* Botão de exclusão */}
                                <Delete
                                    id={item.article_id}
                                    name={item.article_name}
                                    onDelete={handleDelete}
                                />
                            </div>
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
}
