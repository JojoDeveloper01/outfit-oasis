import ItemFilter from "@components/Items/ItemFilter";
import ItemTableUser from "@components/Items/ItemTableUser";
import ItemTableStaff from "@components/Items/ItemTableStaff";
import { useState } from "preact/hooks";
import type { Item } from "@lib/functions";
import { useTranslations } from "@i18n/utils";

interface ItemListProps {
    items: Item[];
    users: any[];
    rentals: any[];
    userType: string;
    lang: any;
    layoutDirection?: string | null;
    width?: any | null;
    height?: any | null;
}

export default function ItemList({ items, users, rentals, userType, lang, layoutDirection = null, width = null, height = null }: ItemListProps) {
    // Estado para usuários filtrados
    const [filteredItems, setFilteredItems] = useState(items);
    const [filters, setFilters] = useState({});
    const t = useTranslations(lang) as (key: string) => string;

    return (
        <div className="h-full">
            {/* Filtro */}

            {items.length > 0 && (
                <ItemFilter items={items} setFilteredItems={setFilteredItems} setFilters={setFilters} t={t} />
            )}

            {/* List */}
            {userType === "staff" ? (
                <ItemTableStaff items={filteredItems} users={users} lang={lang} rentals={rentals} activeFilters={filters} t={t} />
            ) : (
                <ItemTableUser items={filteredItems} rentals={rentals} lang={lang} layoutDirection={layoutDirection} width={width} height={height} />
            )}
        </div>
    );
}
