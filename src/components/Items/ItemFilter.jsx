/* 
 document
            .getElementById("filter-form")
            ?.addEventListener("submit", async (event: any) => {
                event.preventDefault(); // Impede o envio padrão do formulário

                // Captura os valores dos campos do formulário
                const formData = new FormData(event.target);
                const filters = {
                    type: formData.get("type") || "",
                    color: formData.get("color") || "",
                    size: formData.get("size") || "",
                    brand: formData.get("brand") || "",
                };

                // Faz a requisição ao servidor para buscar os itens filtrados
                try {
                    const response = await fetch("/api/filter-items", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(filters),
                    });

                    if (!response.ok)
                        throw new Error("Erro ao buscar os itens.");

                    const items = await response.json();

                    // Atualiza a lista de resultados
                    const resultsContainer: any =
                        document.querySelector(".articles"); // Referência ao container da `ul`
                    resultsContainer.innerHTML = ""; // Limpa os resultados anteriores

                    // Renderiza cada item dinamicamente
                    items.forEach((item: any) => {
                        const listItem = document.createElement("li");
                        listItem.className =
                            "max-w-96 p-6 bg-white shadow-lg rounded-lg border-2 border-gray-300 flex flex-col";
                        listItem.setAttribute("data-item-id", item.article_id);

                        // Monta o HTML do item com destaque nos filtros aplicados
                        listItem.innerHTML = `
                    <div class="flex flex-col space-y-2">
                        <div class="grid gap-2 text-base text-gray-600 item-fields">
                            <p class="font-medium ${
                                filters.type && item.type === filters.type
                                    ? "w-fit bg-[--gray] rounded-xl pl-2 pr-4 py-1"
                                    : ""
                            }">
                                <span class="font-bold">Type</span>: 
                                <span class="value-field">${item.type}</span>
                            </p>
                            <p class="font-medium ${
                                filters.color && item.color === filters.color
                                    ? "w-fit bg-[--gray] rounded-xl pl-2 pr-4 py-1"
                                    : ""
                            }">
                                <span class="font-bold">Color</span>: 
                                <span class="value-field">${item.color}</span>
                            </p>
                            <p class="font-medium ${
                                filters.size && item.size === filters.size
                                    ? "w-fit bg-[--gray] rounded-xl pl-2 pr-4 py-1"
                                    : ""
                            }">
                                <span class="font-bold">Size</span>: 
                                <span class="value-field">${item.size}</span>
                            </p>
                            <p class="font-medium ${
                                filters.brand && item.brand === filters.brand
                                    ? "w-fit bg-[--gray] rounded-xl pl-2 pr-4 py-1"
                                    : ""
                            }">
                                <span class="font-bold">Brand</span>: 
                                <span class="value-field">${item.brand}</span>
                            </p>
                            <p class="font-medium">
                                <span class="font-bold">Name</span>: 
                                <span class="value-field">${item.article_name}</span>
                            </p>
                            <p class="font-medium">
                                <span class="font-bold">Category</span>: 
                                <span class="value-field">${item.category}</span>
                            </p>
                            <p class="font-medium">
                                <span class="font-bold">Rental Price</span>: 
                                <span class="value-field">${item.rental_price}</span> €
                            </p>
                            <p class="font-medium">
                                <span class="font-bold">Condition</span>: 
                                <span class="value-field">${item.condition}</span>
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
                                onclick="document.getElementById('delete-item-${item.article_id}').showModal()"
                                id="delete-btn-${item.article_id}"
                                class="px-4 py-2 text-white bg-[--blush] rounded-full shadow-md hover:bg-[--color3] focus:outline-none"
                            >
                                Delete
                            </button>
                        </div>

                        <div id="save-cancel" class="justify-start space-x-4 mt-4 hidden">
                            <button class="px-4 py-2 text-white bg-[--teal] rounded-full shadow-md hover:bg-[--color2] focus:outline-none save-item">
                                Save
                            </button>
                            <button class="px-4 py-2 text-white bg-[--blush] rounded-full shadow-md hover:bg-[--color3] focus:outline-none cancel-item">
                                Cancel
                            </button>
                        </div>
                    </div>
                `;

                        resultsContainer.appendChild(listItem); // Adiciona o item na `ul`
                    });
                } catch (error) {
                    console.error(error);
                    alert("Erro ao filtrar os itens.");
                }
            });
*/

import { useState, useEffect } from "preact/hooks";

const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

export default function ItemFilter({ items, setFilteredItems }) {
    const [type, setType] = useState("");
    const [color, setColor] = useState("");
    const [size, setSize] = useState("");
    const [brand, setBrand] = useState("");
    const [rentalPrice, setRentalPrice] = useState("");

    useEffect(() => {
        const handleFilter = debounce(() => {
            const filtered = items.filter((product) => {
                const matchesType = type ? product.type === type : true;
                const matchesColor = color
                    ? product.color.toLowerCase().includes(color.toLowerCase())
                    : true;
                const matchesSize = size ? product.size === size : true;
                const matchesBrand = brand
                    ? product.brand.toLowerCase().includes(brand.toLowerCase())
                    : true;

                const matchesRentalPrice = rentalPrice
                    ? rentalPrice === "lowest"
                        ? product.rental_price === Math.min(...items.map(p => p.rental_price))
                        : product.rental_price === Math.max(...items.map(p => p.rental_price))
                    : true;

                return (
                    matchesType &&
                    matchesColor &&
                    matchesSize &&
                    matchesBrand &&
                    matchesRentalPrice
                );
            });

            setFilteredItems(filtered);
        }, 300); // 300ms debounce

        handleFilter();
    }, [type, color, size, brand, rentalPrice]); // Atualiza ao alterar filtros

    return (
        <div className="grid gap-4 bg-white p-4 rounded-lg shadow-md">
            <div className="flex flex-wrap gap-2">
                {/* Type Dropdown */}
                <div>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="">Todos</option>
                        <option value="footwear">Footwear</option>
                        <option value="t-shirt">T-shirt</option>
                    </select>
                </div>

                {/* Color Input */}
                <div>
                    <input
                        type="text"
                        placeholder="Digite a cor..."
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="border p-2 rounded"
                    />
                </div>

                {/* Size Dropdown */}
                <div>
                    <select
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="">Todos</option>
                        <option value="P">P</option>
                        <option value="M">M</option>
                        <option value="G">G</option>
                        <option value="L">L</option>
                    </select>
                </div>

                {/* Brand Input */}
                <div>
                    <input
                        type="text"
                        placeholder="Digite a marca..."
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="border p-2 rounded"
                    />
                </div>

                {/* Rental Price Dropdown */}
                <div>
                    <select
                        value={rentalPrice}
                        onChange={(e) => setRentalPrice(e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="lowest">Lowest</option>
                        <option value="highest">Highest</option>
                    </select>
                </div>
            </div>

            {/* Filtro Aplicado */}
            <div className="flex gap-4">
                <button
                    onClick={() => console.log("Filtros aplicados:", { type, color, size, brand, rentalPrice })}
                    className="w-32 px-4 py-2 text-sm font-medium text-white bg-teal-500 rounded-lg hover:bg-teal-600 focus:ring-4 focus:outline-none focus:ring-teal-300"
                >
                    Filtrar
                </button>
            </div>
        </div>
    );
}
