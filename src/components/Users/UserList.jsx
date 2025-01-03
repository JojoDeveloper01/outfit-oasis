import { useState } from "preact/hooks";
import UserFilter from "./UserFilter";
import UserTable from "./UserTable";

export default function UsersList({ users }) {
    // Estado para usuários filtrados
    const [filteredUsers, setFilteredUsers] = useState(users);
    const [filters, setFilters] = useState({});

    return (
        <section>
            {/* Filtro */}
            <UserFilter
                users={users}
                setFilteredUsers={setFilteredUsers}
                setFilters={setFilters}
            />

            {/* Tabela */}
            <UserTable users={filteredUsers} activeFilters={filters} />
        </section>
    );
}
