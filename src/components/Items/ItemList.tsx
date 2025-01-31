import ItemFilter from "@components/Items/ItemFilter";
import ItemTableUser from "@components/Items/ItemTableUser";
import ItemTableStaff from "@components/Items/ItemTableStaff";
import { useState } from "preact/hooks";

interface ItemListProps {
    items: any[];
    users: any[];
    rentals: any[];
    userType: string;
    lang: string;
    layoutDirection?: string | null;
    width?: any | null;
    height?: any | null;
}

export default function ItemList({ items, users, rentals, userType, lang, layoutDirection = null, width = null, height = null }: ItemListProps) {
    // Estado para usuários filtrados
    const [filteredItems, setFilteredItems] = useState(items);
    const [filters, setFilters] = useState({});

    return (
        <div className="h-full">
            {/* Filtro */}

            {items.length > 0 && (
                <ItemFilter items={items} setFilteredItems={setFilteredItems} setFilters={setFilters} />
            )}

            {/* List */}
            {userType === "staff" ? (
                <ItemTableStaff items={filteredItems} users={users} rentals={rentals} activeFilters={filters} />
            ) : (
                <ItemTableUser items={filteredItems} rentals={rentals} lang={lang} layoutDirection={layoutDirection} width={width} height={height} />
            )}
        </div>
    );
}
