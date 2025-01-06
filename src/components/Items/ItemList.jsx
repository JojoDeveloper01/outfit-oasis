import ItemFilter from "@components/Items/ItemFilter";
import ItemTableUser from "@components/Items/ItemTableUser";
import ItemTableStaff from "@components/Items/ItemTableStaff";
import { useState } from "preact/hooks";

export default function ItemList({ items, userType, lang }) {
    // Estado para usuários filtrados
    const [filteredItems, setFilteredItems] = useState(items);
    const [filters, setFilters] = useState({});

    return (
        <section>
            {/* Filtro */}

            {items.length > 0 && (
                <ItemFilter items={items} setFilteredItems={setFilteredItems} setFilters={setFilters} />
            )}

            {/* List */}
            {userType === "staff" ? (
                <ItemTableStaff items={filteredItems} activeFilters={filters} />
            ) : (
                <ItemTableUser items={filteredItems} lang={lang} />
            )}
        </section>
    );
}
