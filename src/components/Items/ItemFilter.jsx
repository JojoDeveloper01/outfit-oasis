import { useState, useEffect } from "preact/hooks";

const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

export default function ItemFilter({ items, setFilteredItems, setFilters, t }) {
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
        <div className="grid gap-[1vw] py-[1vw] rounded-lg shadow-md">
            <div className="flex flex-wrap gap-[.7vw]">
                {/* Search Input */}
                <div>
                    <input
                        id="item-search"
                        type="text"
                        placeholder="Search by name, category, brand, or rental price..."
                        value={filters.search}
                        onInput={(e) => updateFilter("search", e.target.value)}
                        className={`border p-[.7vw] rounded w-full h-4/5 ${filters.search ? "border-blue-500" : "border-gray-300"
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
                        className={`border p-[.7vw] rounded ${filters.type ? "border-blue-500" : "border-gray-300"
                            }`}
                    >
                        <option value="">{t("dash.selectType")}</option>
                        <option value="clothing">{t("dash.clothing")}</option>
                        <option value="footwear">{t("dash.footwear")}</option>
                        <option value="other">{t("dash.other")}</option>
                    </select>
                </div>

                {/* Size Dropdown */}
                <div>
                    <select
                        id="item-size-search"
                        value={filters.size}
                        onChange={(e) => updateFilter("size", e.target.value)}
                        className={`border p-[.7vw] rounded`}
                    >
                        <option value="">{t("dash.selectSize")}</option>
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
                        className={`border p-[.7vw] rounded`}
                    >
                        <option value="">{t("dash.selectColor")}</option>
                        <option value="red">{t("color.red")}</option>
                        <option value="blue">{t("color.blue")}</option>
                        <option value="yellow">{t("color.yellow")}</option>
                        <option value="green">{t("color.green")}</option>
                        <option value="brown">{t("color.brown")}</option>
                        <option value="black">{t("color.black")}</option>
                        <option value="white">{t("color.white")}</option>
                        <option value="other">{t("color.other")}</option>
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
                        className={`border p-[.7vw] rounded ${filters.condition
                            ? "border-blue-500"
                            : "border-gray-300"
                            }`}
                    >
                        <option value="">{t("dash.selectCondition")}</option>
                        <option value="new">{t("dash.new")}</option>
                        <option value="used">{t("dash.used")}</option>
                        <option value="worn">{t("dash.worn")}</option>
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
                        className={`border p-[.7vw] rounded ${filters.rentalPrice
                            ? "border-blue-500"
                            : "border-gray-300"
                            }`}
                    >
                        <option value="">{t("dash.rentalPrice")}</option>
                        <option value="lowest">{t("util.lowest")}</option>
                        <option value="highest">{t("util.highest")}</option>
                    </select>
                </div>

                {/* Refresh Button */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-reload"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M19.933 13.041a8 8 0 1 1 -9.925 -8.788c3.899 -1 7.935 1.007 9.425 4.747" /><path d="M20 4v5h-5" /></svg>
                    </button>
                )}
            </div>

        </div>
    );
}
