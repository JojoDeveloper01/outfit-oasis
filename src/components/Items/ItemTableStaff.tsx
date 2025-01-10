import { useState, useEffect } from "preact/hooks";
import Delete from "../Modal/Delete";
import PreviewImage from "../Modal/PreviewImage";
import ErrorTooltip from "../Modal/ErrorTooltip";
import { actions } from "astro:actions";
import { sanitizeName } from "@lib/functions"
import type { VNode } from "preact";

interface Item {
    rentalUsers: any;
    id: number;
    name: string;
    category: string;
    type: string;
    size: string;
    color: string;
    brand: string;
    condition: string;
    rental_price: number;
    image?: string;
    availability: number;
}

export default function ItemCard({ items, users, rentals, activeFilters }: { items: Item[], users: any, rentals: any, activeFilters: { [key: string]: string } }) {
    const [data, setData] = useState(items); // Estado dos itens
    const [errors, setErrors] = useState<{ [key: string]: string | null }>({}); // Estado de erros
    const [originalValues, setOriginalValues] = useState<{ [key: number]: Item }>({}); // Valores originais dos itens

    /*  {
         id: 37,
         name: 'Camisola de Lã Fecho para Correr',
         type: 'clothing',
         category: 'casuala',
         size: 'M',
         color: 'blue',
         brand: 'MO',
         rental_price: 223,
         image: '/items_images/item_camisola-de-l-fecho-para-correr.png',
         condition: 'new',
         availability: 1,
         added_date: '2025-01-02 17:29:17'
       } */

    // Sincronizar `data` e `originalValues` com `items`
    useEffect(() => {
        // Combinar os dados dos itens com aluguéis e usuários
        const combinedData = items.map((item) => {
            // Filtrar aluguéis relacionados ao item atual
            const relatedRentals = rentals.filter((rental: { article_id: number; }) => rental.article_id === item.id);

            // Adicionar detalhes do usuário a cada aluguel
            const rentalUsers = relatedRentals.map((rental: { user_id: any; }) => {
                const user = users.find((u: { id: number; }) => u.id === rental.user_id); // Encontrar usuário correspondente
                return {
                    ...rental,
                    userName: user?.name || "Utilizador desconhecido",
                    email: user?.email || "Email não disponível",
                };
            });

            // Combinar item com informações de aluguel e usuários
            return {
                ...item,
                rentalUsers, // Adiciona os usuários e detalhes de aluguel ao item
            };
        });

        setData(combinedData); // Atualiza o estado `data` com os dados combinados
        setOriginalValues(
            items.reduce((acc: { [key: number]: Item }, item) => {
                acc[item.id] = { ...item };
                return acc;
            }, {})
        );
    }, [items, rentals, users]);


    const highlightMatch = (field: string, value: { toString: () => string; }) => {
        if (!activeFilters[field]) return false; // No filter applied
        return value.toString().toLowerCase() === activeFilters[field].toString().toLowerCase();
    };

    // Função para remover um item do estado
    const handleDelete = (itemId: number) => {
        setData((prevData) => prevData.filter((item) => item.id !== itemId));
    };

    // Atualizar valor de um campo
    const handleFieldChange = async (event: any, itemId: any, field: any) => {
        const value = event.target.value.trim();

        setData((prevData) =>
            prevData.map((item) =>
                item.id === itemId ? { ...item, [field]: value } : item
            )
        );

        try {
            const { data, error } = await actions.validateItemField({
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
    const handleSave = async (itemId: number, field: string) => {
        const value = data.find((item) => item.id === itemId)?.[field as keyof Item];

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
        <div className="flex flex-col gap-2 mt-8">
            {data.length === 0 ? (
                <div className="py-3 px-4">No items available.</div>
            ) : (
                data.map((item) => (
                    <div
                        key={item.id}
                        className="flex flex-wrap items-start gap-2 p-4 bg-white shadow-lg rounded-lg border border-gray-300"
                    >
                        <div
                            className={`mx-12 my-4 px-4 py-2 text-sm font-medium border rounded-lg ${item.availability
                                ? "bg-green-100 text-green-800 border-green-400"
                                : "bg-orange-100 text-orange-800 border-orange-400"
                                }`}
                        >
                            {item.availability ? "Available" : "Reserved"}
                        </div>

                        {/* Campos */}
                        <div className="flex flex-wrap gap-2 flex-grow px-12">

                            {/* Imagem */}
                            {item.image && (
                                <div className="py-3 px-4">
                                    < PreviewImage src={item.image} type="item" />
                                    <img
                                        onClick={() => {
                                            const previewImageElement = document.getElementById(
                                                `preview-item-image-${item.image}`
                                            );
                                            if (previewImageElement) {
                                                (previewImageElement as HTMLDialogElement).showModal();
                                            }
                                        }}
                                        src={item.image}
                                        alt="Item image"
                                        className=" w-12 h-12 rounded-full object-cover cursor-pointer"
                                    />
                                </div>
                            )}
                            {["name", "category", "type", "size", "color", "brand", "condition", "rental_price"].map((field) => (
                                <div
                                    key={`${item.id}-${field}`}
                                    className={`relative flex flex-col gap-2`}
                                >
                                    <label className="font-bold text-sm text-gray-600" htmlFor={field}>
                                        {field.replace("_", " ")}
                                    </label>

                                    <div className={`flex items-stretch gap-2 min-w-32 max-w-56`}>

                                        {/* Conditional rendering for input types */}
                                        <div className="p-1 min-w-24 max-w-48 *:m-0">
                                            {["name", "category", "brand", "rental_price"].includes(field) ? (
                                                <input
                                                    type="text"
                                                    id={`${item.id}-${field}`}
                                                    name={field}
                                                    value={item[field as keyof Item] || ""}
                                                    className={`${errors[`${item.id}-${field}`] ? "border-red-500" : ""} ${highlightMatch(field, item[field as keyof Item] ?? "") ? "ring-2 ring-yellow-500" : ""}`}
                                                    placeholder={`Enter ${field.replace("_", " ")}`}
                                                    onInput={(e) => handleFieldChange(e, item.id, field)}
                                                    autoComplete="off"
                                                />
                                            ) : (
                                                <select
                                                    id={`${item.id}-${field}`}
                                                    name={field}
                                                    value={item[field as keyof Item] || ""}
                                                    className={`${errors[`${item.id}-${field}`] ? "border-red-500" : ""} ${highlightMatch(field, item[field as keyof Item] ?? "") ? "ring-2 ring-yellow-500" : ""}`}
                                                    onChange={(e) => handleFieldChange(e, item.id, field)}
                                                >
                                                    {/* Options for each dropdown */}
                                                    {field === "type" && (
                                                        <>
                                                            <option value="">Select Type</option>
                                                            <option value="clothing">Clothing</option>
                                                            <option value="footwear">Footwear</option>
                                                            <option value="other">Other</option>
                                                        </>
                                                    )}
                                                    {field === "size" && (
                                                        <>
                                                            <option value="">Select Size</option>
                                                            <option value="XS">XS</option>
                                                            <option value="S">S</option>
                                                            <option value="M">M</option>
                                                            <option value="L">L</option>
                                                            <option value="XL">XL</option>
                                                            <option value="XXL">XXL</option>
                                                        </>
                                                    )}
                                                    {field === "color" && (
                                                        <>
                                                            <option value="">Select Color</option>
                                                            <option value="red">Red</option>
                                                            <option value="blue">Blue</option>
                                                            <option value="yellow">Yellow</option>
                                                            <option value="green">Green</option>
                                                            <option value="brown">Brown</option>
                                                            <option value="black">Black</option>
                                                            <option value="white">White</option>
                                                            <option value="other">Other</option>
                                                        </>
                                                    )}
                                                    {field === "condition" && (
                                                        <>
                                                            <option value="">Select Condition</option>
                                                            <option value="new">New</option>
                                                            <option value="used">Used</option>
                                                            <option value="worn">Worn</option>
                                                        </>
                                                    )}
                                                </select>
                                            )}
                                        </div>

                                        {/* Save Button */}
                                        <div class="w-8 *:h-full">
                                            {!errors[`${item.id}-${field}`] &&
                                                originalValues[item.id] && // Garante que `originalValues` existe
                                                item[field as keyof Item] !==
                                                originalValues[item.id][field as keyof Item] && (
                                                    <button onClick={() => handleSave(item.id, field)}>
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

                                        {/* Error Tooltip */}
                                        {errors[`${item.id}-${field}`] && (
                                            <ErrorTooltip
                                                id={`${item.id}-${field}`}
                                                message={errors[`${item.id}-${field}`]}
                                            />
                                        )}

                                    </div>

                                </div>
                            ))}
                        </div>

                        {/* Locações históricas */}
                        <details className="w-full my-4 px-12">
                            <summary className="flex items-center justify-between cursor-pointer p-5 font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-100">
                                Historical Rents
                                <span className="text-[#00671e] font-bold">{item.rentalUsers?.length || 0}</span>
                            </summary>
                            <div className="bg-gray-100 border-t border-gray-200 rounded-b-lg">
                                {item.rentalUsers?.length ? (
                                    item.rentalUsers.map(
                                        (
                                            renter: {
                                                userName: string;
                                                start_date: string;
                                                end_date: string;
                                                rental_status: string;
                                                return_date: string | null;
                                                total_cost: number;
                                            },
                                            index: number
                                        ) => (
                                            <div
                                                key={index}
                                                className="flex flex-wrap items-center gap-4 px-4 py-6 border-b border-gray-300 bg-white rounded-md shadow-sm"
                                            >
                                                {/* Name */}
                                                <div className="flex flex-col gap-2">
                                                    <span className="px-4 py-1 text-black-600 text-sm font-medium bg-[#f0f0f0] rounded-lg">Name</span>
                                                    <span className="text-gray-800 font-bold">{renter.userName}</span>
                                                </div>

                                                {/* Start Date */}
                                                <div className="flex flex-col gap-2">
                                                    <span className="px-4 py-1 text-black-600 text-sm font-medium bg-[#f0f0f0] rounded-lg">Start Date</span>
                                                    <span className="text-gray-800">{renter.start_date}</span>
                                                </div>

                                                {/* End Date */}
                                                <div className="flex flex-col gap-2">
                                                    <span className="px-4 py-1 text-black-600 text-sm font-medium bg-[#f0f0f0] rounded-lg">End Date</span>
                                                    <span className="text-gray-800">{renter.end_date}</span>
                                                </div>

                                                {/* Status */}
                                                <div className="flex flex-col gap-2">
                                                    <span className="px-4 py-1 text-black-600 text-sm font-medium bg-[#f0f0f0] rounded-lg">Status</span>
                                                    <span className="text-gray-800">{renter.rental_status}</span>
                                                </div>

                                                {/* Return */}
                                                <div className="flex flex-col gap-2">
                                                    <span className="px-4 py-1 text-black-600 text-sm font-medium bg-[#f0f0f0] rounded-lg">Return</span>
                                                    <span className="text-gray-800">{renter.return_date || "Pending"}</span>
                                                </div>

                                                {/* Total Cost */}
                                                <div className="flex flex-col gap-2">
                                                    <span className="px-4 py-1 text-black-600 text-sm font-medium bg-[#f0f0f0] rounded-lg">Total Cost</span>
                                                    <span className="text-gray-800 font-bold">${renter.total_cost}</span>
                                                </div>
                                            </div>
                                        )
                                    )
                                ) : (
                                    <div className="p-5 text-sm text-gray-500">No rentals recorded.</div>
                                )}
                            </div>
                        </details>


                        {/* Botões de ação */}
                        <div className="w-full flex flex-col gap-2 items-end">
                            <Delete
                                name={sanitizeName(item.name)}
                                id={item.id}
                                imagePath={item.image}
                                type="item"
                                onDelete={handleDelete}
                            />
                        </div>
                    </div>
                ))
            )}
        </div>

    );
}
