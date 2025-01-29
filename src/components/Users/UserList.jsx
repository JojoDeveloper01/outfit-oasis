import { useState } from "preact/hooks";
import UserFilter from "./UserFilter";
import UserTable from "./UserTable";
import ShowUsers from "./ShowUsers";

export default function UsersList({ users, userType }) {
    // Estado para usuários filtrados
    const [filteredUsers, setFilteredUsers] = useState(users);
    const [filters, setFilters] = useState({});

    return (
        <section>
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
            {userType === "staff" ? (
                <UserTable users={filteredUsers} activeFilters={filters} />
            ) : (
                <ShowUsers users={filteredUsers} />
            )}
        </section>
    );
}
