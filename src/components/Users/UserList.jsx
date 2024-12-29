import { useState } from "preact/hooks";
import UserFilter from "./UserFilter";
import UserTable from "./UserTable";

export default function UsersList({ users }) {
    // Estado para usuários filtrados
    const [filteredUsers, setFilteredUsers] = useState(users);

    return (
        <section>
            {/* Filtro */}
            <UserFilter
                users={users}
                setFilteredUsers={setFilteredUsers} // Atualiza o estado de usuários filtrados
            />

            {/* Tabela */}
            <UserTable users={filteredUsers} />
        </section>
    );
}
