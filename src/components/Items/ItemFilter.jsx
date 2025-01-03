import { useState, useEffect } from "preact/hooks";

const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

export default function ItemFilter({ items, setFilteredItems, setFilters }) {
    const [filters, setLocalFilters] = useState({
        type: "",
        color: "",
        size: "",
        brand: "",
        condition: "",
        rentalPrice: "",
    });

    useEffect(() => {
        const handleFilter = debounce(() => {
            const filtered = items.filter((item) => {
                const matchesSearch = filters.search
                    ? item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                    item.category.toLowerCase().includes(filters.search.toLowerCase()) ||
                    item.brand.toLowerCase().includes(filters.search.toLowerCase()) ||
                    item.rental_price.toString().includes(filters.search)
                    : true;

                const matchesType = filters.type ? item.type === filters.type : true;
                const matchesColor = filters.color
                    ? item.color.toLowerCase().includes(filters.color.toLowerCase())
                    : true;
                const matchesSize = filters.size ? item.size === filters.size : true;
                const matchesCondition = filters.condition
                    ? item.condition.toLowerCase().includes(filters.condition.toLowerCase())
                    : true;
                const matchesRentalPrice = filters.rentalPrice
                    ? filters.rentalPrice === "lowest"
                        ? item.rental_price === Math.min(...items.map((p) => p.rental_price))
                        : item.rental_price === Math.max(...items.map((p) => p.rental_price))
                    : true;

                return (
                    matchesSearch &&
                    matchesType &&
                    matchesColor &&
                    matchesSize &&
                    matchesCondition &&
                    matchesRentalPrice
                );
            });

            setFilteredItems(filtered);
            setFilters(filters); // Update active filters
        }, 300);

        handleFilter();
    }, [filters]);

    const updateFilter = (key, value) => {
        setLocalFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const clearFilters = () => {
        setLocalFilters({
            type: "",
            color: "",
            size: "",
            brand: "",
            condition: "",
            rentalPrice: "",
        });
        setFilteredItems(items); // Reset the filtered items to the full list
        setFilters({}); // Clear the filters
    };

    const hasActiveFilters = Object.values(filters).some((value) => value);

    return (
        <div className="grid gap-4 bg-white p-4 rounded-lg shadow-md">
            <div className="flex flex-wrap gap-2">
                {/* Search Input */}
                <div>
                    <input
                        id="item-search"
                        type="text"
                        placeholder="Search by name, category, brand, or rental price..."
                        value={filters.search}
                        onInput={(e) => updateFilter("search", e.target.value)}
                        className={`border p-2 rounded w-full ${filters.search ? "border-blue-500" : "border-gray-300"
                            }`}
                        autoComplete={"off"}
                    />
                </div>

                {/* Type Dropdown */}
                <div>
                    <select
                        id="item-type-search"
                        value={filters.type}
                        onChange={(e) => updateFilter("type", e.target.value)}
                        className={`border p-2 rounded ${filters.type ? "border-blue-500" : "border-gray-300"
                            }`}
                    >
                        <option value="">Type</option>
                        <option value="clothing">clothing</option>
                        <option value="footwear">footwear</option>
                        <option value="other">other</option>
                    </select>
                </div>

                {/* Size Dropdown */}
                <div>
                    <select
                        id="item-size-search"
                        value={filters.size}
                        onChange={(e) => updateFilter("size", e.target.value)}
                        className={`border p-2 rounded`}
                    >
                        <option value="">Size</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                    </select>
                </div>

                {/* Color Input */}
                <div>
                    <select
                        id="item-color-search"
                        value={filters.color}
                        onChange={(e) => updateFilter("color", e.target.value)}
                        className={`border p-2 rounded`}
                    >
                        <option value="">Colors</option>
                        <option value="red">red</option>
                        <option value="blue">blue</option>
                        <option value="yellow">yellow</option>
                        <option value="green">green</option>
                        <option value="brown">brown</option>
                        <option value="black">black</option>
                        <option value="white">white</option>
                        <option value="other">other</option>
                    </select>
                </div>

                {/* Condition Dropdown */}
                <div>
                    <select
                        id="item-condition-search"
                        value={filters.condition}
                        onChange={(e) =>
                            updateFilter("condition", e.target.value)
                        }
                        className={`border p-2 rounded ${filters.condition
                            ? "border-blue-500"
                            : "border-gray-300"
                            }`}
                    >
                        <option value="">Condition</option>
                        <option value="new">new</option>
                        <option value="used">used</option>
                        <option value="worn">worn</option>
                    </select>
                </div>

                {/* Rental Price Dropdown */}
                <div>
                    <select
                        id="item-rentalPrice-search"
                        value={filters.rentalPrice}
                        onChange={(e) =>
                            updateFilter("rentalPrice", e.target.value)
                        }
                        className={`border p-2 rounded ${filters.rentalPrice
                            ? "border-blue-500"
                            : "border-gray-300"
                            }`}
                    >
                        <option value="">Rental Price</option>
                        <option value="lowest">Lowest</option>
                        <option value="highest">Highest</option>
                    </select>
                </div>

                {/* Refresh Button */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="ml-8"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-reload"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M19.933 13.041a8 8 0 1 1 -9.925 -8.788c3.899 -1 7.935 1.007 9.425 4.747" /><path d="M20 4v5h-5" /></svg>
                    </button>
                )}
            </div>

        </div>
    );
}
