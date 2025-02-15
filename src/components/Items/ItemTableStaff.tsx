import { useState, useEffect } from "preact/hooks";
import Delete from "../Modal/Delete";
import PreviewImage from "../Modal/PreviewImage";
import ErrorTooltip from "../Modal/ErrorTooltip";
import { actions } from "astro:actions";
import { sanitizeName, type Item } from "@lib/functions"
import type { ComponentChild, VNode } from "preact";
import type { JSX } from "preact/jsx-runtime";

export default function ItemCard({ items, users, rentals, activeFilters }: { items: Item[], users: any, rentals: any, activeFilters: { [key: string]: string } }) {
    const [data, setData] = useState(items); // Estado dos itens
    const [errors, setErrors] = useState<{ [key: string]: string | null }>({}); // Estado de erros
    const [originalValues, setOriginalValues] = useState<{ [key: number]: Item }>({}); // Valores originais dos itens
    // Estado que controla se vamos (true) ou não (false) esconder os "completed"
    const [hideCompleted, setHideCompleted] = useState(true);

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
       } 
    */

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

        // Store the original values, including rentalUsers
        setOriginalValues(
            combinedData.reduce((acc: { [key: number]: Item }, item) => {
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

    // Atualizar valor de um campo
    const handleRentalStatusChange = async (event: any, rental_id: number, field: string) => {
        const value = event.target.value.trim();

        setData((prevData) =>
            prevData.map((item) => ({
                ...item,
                rentalUsers: (item.rentalUsers ?? []).map((rental: { rental_id: number; }) =>
                    rental.rental_id === rental_id ? { ...rental, [field]: value } : rental
                ),
            }))
        );


        try {
            const { data, error } = await actions.validateRentField({
                id: Number(rental_id),
                value,
            });

            if (error || !data.valid) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    [`${rental_id}-${field}`]: data?.message || error?.message || "Validation error",
                }));
            } else {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    [`${rental_id}-${field}`]: null,
                }));
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            setErrors((prevErrors) => ({
                ...prevErrors,
                [`${rental_id}-${field}`]: "An unexpected error occurred.",
            }));
        }
    };

    const handleSaveStatusRent = async (rental_id: number, field: string) => {
        const value = data
            .flatMap((item) => item.rentalUsers)
            .find((rental) => rental.rental_id === rental_id)?.[field];

        try {
            const { error } = await actions.editRent({ id: rental_id, value });

            if (error) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    [`${rental_id}-${field}`]: error.message,
                }));
            } else {
                // Update `originalValues` to reflect the saved status
                setOriginalValues(() =>
                    data.reduce((acc: { [key: number]: Item }, item) => {
                        acc[item.id] = {
                            ...item,
                            rentalUsers: (item.rentalUsers ?? []).map((rental: { rental_id: number; }) =>
                                rental.rental_id === rental_id
                                    ? { ...rental, [field]: value } // Update the saved field in originalValues
                                    : rental
                            ),
                        };
                        return acc;
                    }, {})
                );
            }
        } catch (err) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                [`${rental_id}-${field}`]: "An unexpected error occurred.",
            }));
        }
    };

    interface StatusColorMap {
        [key: string]: string;
    }

    const statusBg = (status: string): string => {
        const colorMap: StatusColorMap = {
            completed: "bg-[#9df3cd]",
            active: "bg-[#ffd4ad]",
            late: "bg-[#f9b9b9]",
        };

        return colorMap[status] || "";
    };
    return (
        <div className="flex flex-col gap-[.7vw] mt-8">
            {data.length === 0 ? (
                <div className="py-[.8vw] px-[1vw]">No items available.</div>
            ) : (
                data.map((item) => {
                    // Filtra os rentals específicos deste item
                    const itemRentals = hideCompleted
                        ? (item.rentalUsers || []).filter((r: { rental_status: string; }) => r.rental_status !== "completed")
                        : (item.rentalUsers || []);


                    // Verifica se este item tem pelo menos um rental "completed"
                    const hasCompletedRentals = (item.rentalUsers || []).some(
                        (r: { rental_status: string; }) => r.rental_status === "completed"
                    );

                    return (
                        <div
                            key={item.id}
                            className="flex flex-wrap items-start gap-[.7vw] p-[1vw] pt-7  shadow-lg rounded-lg bg-[--gray]"
                        >
                            {/* Campos */}
                            <div className="flex flex-wrap gap-[1vw] flex-grow px-12">

                                {/* Imagem */}
                                {item.image && (
                                    <div className="py-[.8vw] px-[1vw]">
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
                                        className={`relative flex flex-col gap-[.7vw]`}
                                    >
                                        <label className="font-bold text-[1vw] text-white" htmlFor={field}>
                                            {field.replace("_", " ")}
                                        </label>

                                        <div className={`relative flex items-stretch gap-[.7vw] min-w-32 max-w-56 mt-[1vw]`}>

                                            {/* Conditional rendering for input types */}
                                            <div className="p-1 min-w-24 max-w-48 *:m-0">
                                                {["name", "category", "brand", "rental_price"].includes(field) ? (
                                                    <input
                                                        type="text"
                                                        id={`${item.id}-${field}`}
                                                        name={field}
                                                        value={String(item[field as keyof Item] || "")}
                                                        className={`${errors[`${item.id}-${field}`] ? "border-red-500" : ""} ${highlightMatch(field, item[field as keyof Item] ?? "") ? "ring-2 ring-[--gold]" : ""}`}
                                                        placeholder={`Enter ${field.replace("_", " ")}`}
                                                        onInput={(e) => handleFieldChange(e, item.id, field)}
                                                        autoComplete="off"
                                                    />
                                                ) : (
                                                    <select
                                                        id={`${item.id}-${field}`}
                                                        name={field}
                                                        value={String(item[field as keyof Item] || "")}
                                                        className={`${errors[`${item.id}-${field}`] ? "border-red-500" : ""} ${highlightMatch(field, item[field as keyof Item] ?? "") ? "ring-2 ring-[--gold]" : ""}`}
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
                                <summary className="flex items-center justify-between cursor-pointer p-5 font-medium bg-[--background] text-[--color-white1] hover:bg-[--grayLight] rounded-lg">
                                    Historical Rents
                                    <div className="flex items-center gap-4">
                                        <span className="text-[--gold] font-bold">{itemRentals.length || 0}</span>

                                        {/* Se o item tiver pelo menos 1 rental "completed", mostra o botão */}
                                        {hasCompletedRentals && (
                                            <button
                                                type="button"
                                                onClick={() => setHideCompleted((prev) => !prev)}
                                                className="ml-4 py-[.3vw] px-2 text-[1vw] rounded bg-[--color-white] text-[--color-black]"
                                            >
                                                {hideCompleted ? "Mostrar Completados" : "Ocultar Completados"}
                                            </button>
                                        )}
                                    </div>
                                </summary>

                                <div className="bg-[--background] border-t border-[--color-white] rounded-b-lg">
                                    {itemRentals.length ? (
                                        itemRentals.map((renter: { rental_status: JSX.Signalish<string | number | undefined>; userName: string | number | bigint | boolean | object | ComponentChild[] | VNode<any> | null | undefined; start_date: string | number | bigint | boolean | object | ComponentChild[] | VNode<any> | null | undefined; end_date: string | number | bigint | boolean | object | ComponentChild[] | VNode<any> | null | undefined; rental_id: number; return_date: any; total_cost: string | number | bigint | boolean | object | VNode<any> | null | undefined; }, index: unknown) => (
                                            <div
                                                key={index}
                                                className={`flex flex-wrap items-center gap-[1vw] px-[1vw] py-6 border-b rounded-md shadow-sm hover:bg-[--gray]`}
                                            >
                                                {/* Name */}
                                                <div className="flex flex-col gap-[.7vw]">
                                                    <span className={` px-[1vw] py-[.3vw] text-[1vw] font-bold rounded-lg`}>
                                                        Name
                                                    </span>
                                                    <span className="px-[1vw] font-extralight">{renter.userName}</span>
                                                </div>

                                                {/* Start Date */}
                                                <div className="flex flex-col gap-[.7vw]">
                                                    <span className={` px-[1vw] py-[.3vw] text-[1vw] font-bold rounded-lg}`}>
                                                        Start Date
                                                    </span>
                                                    <span className="px-[1vw] font-extralight">{renter.start_date}</span>
                                                </div>

                                                {/* End Date */}
                                                <div className="flex flex-col gap-[.7vw]">
                                                    <span className={` px-[1vw] py-[.3vw] text-[1vw] font-bold rounded-lg}`}>
                                                        End Date
                                                    </span>
                                                    <span className="px-[1vw] font-extralight">{renter.end_date}</span>
                                                </div>

                                                {/* Status */}
                                                <div className="flex flex-col gap-[.7vw]">
                                                    <span className={` px-[1vw] py-[.3vw] text-[1vw] font-bold rounded-lg}`}>
                                                        Status
                                                    </span>
                                                    <div className="flex gap-[.7vw]">
                                                        <select
                                                            id={`${renter.rental_id}-rental_status`}
                                                            name="rental_status"
                                                            value={renter.rental_status}
                                                            style={{ width: "7rem", paddingRight: "0.5rem" }}
                                                            className={`px-2 py-[.3vw] rounded cursor-pointer text-[--color-black] ${statusBg(String(renter.rental_status))}`}
                                                            onChange={(e) => handleRentalStatusChange(e, renter.rental_id, "rental_status")}
                                                        >
                                                            <option value="active">Active</option>
                                                            <option value="completed">Completed</option>
                                                            <option value="late">Late</option>
                                                        </select>

                                                        <div className="w-8">
                                                            {!errors[`${renter.rental_id}-rental_status`] &&
                                                                originalValues[item.id] &&
                                                                renter.rental_status !==
                                                                originalValues[item.id]?.rentalUsers?.find(
                                                                    (r: any) => r.rental_id === renter.rental_id
                                                                )?.rental_status && (
                                                                    <button onClick={() => handleSaveStatusRent(renter.rental_id, "rental_status")}>
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
                                                    </div>
                                                </div>

                                                {/* Return */}
                                                <div className="flex flex-col gap-[.7vw]">
                                                    <span className={` px-[1vw] py-[.3vw] text-[1vw] font-bold rounded-lg}`}>
                                                        Return
                                                    </span>
                                                    <span className="px-[1vw] font-extralight">{renter.return_date || "Pending"}</span>
                                                </div>

                                                {/* Total Cost */}
                                                <div className="flex flex-col gap-[.7vw]">
                                                    <span className={` px-[1vw] py-[.3vw] text-[1vw] font-bold rounded-lg}`}>
                                                        Total Cost
                                                    </span>
                                                    <span className="px-[1vw] font-extralight">${renter.total_cost}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-5 text-[1vw] text-[--color-white1] bg-[--background]">No rentals recorded.</div>
                                    )}
                                </div>
                            </details>

                            {/* Botões de ação */}
                            <div className="w-full flex flex-col gap-[.7vw] items-end px-12">
                                <Delete
                                    name={sanitizeName(item.name)}
                                    id={item.id}
                                    imagePath={item.image}
                                    type="item"
                                    onDelete={handleDelete}
                                />
                            </div>
                        </div>
                    )
                })
            )}
        </div>

    );
}
