import { userExistsByID } from "@lib/dbFunctions";
import Delete from "@components/Modal/Delete";
import ItemCards from "@components/Items/ItemCard";
import ItemFilter from "@components/Items/ItemFilter";
import { useState } from "preact/hooks";

export default function ItemList({ items }) {
    // Estado para usuários filtrados
    const [filteredItems, setFilteredItems] = useState(items);

    return (
        <section>
            {/* Filtro */}
            <ItemFilter items={items} setFilteredItems={setFilteredItems} />

            {/* List */}
            <ItemCards items={filteredItems} />
        </section>
    );
}
