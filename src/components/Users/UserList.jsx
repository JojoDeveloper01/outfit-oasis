import { useState } from "preact/hooks";
import UserFilter from "./UserFilter";
import UserTable from "./UserTable";

export default function UsersList({ users, userType }) {
    // Estado para usuários filtrados
    const [filteredUsers, setFilteredUsers] = useState(users);
    const [filters, setFilters] = useState({});

    return (
        <section class="h-fit">
            {/* Filtro */}
            {userType === "staff" ? (
                <UserFilter
                    users={users}
                    setFilteredUsers={setFilteredUsers}
                    setFilters={setFilters}
                />
            ) : (
                null
            )}

            {/* Tabela */}
            <UserTable users={filteredUsers} userType={userType} activeFilters={filters} />
        </section>
    );
}
