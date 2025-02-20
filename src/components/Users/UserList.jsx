import { useState } from "preact/hooks";
import UserFilter from "./UserFilter";
import UserTable from "./UserTable";
import { useTranslations } from "@i18n/utils";

export default function UsersList({ users, userType, lang }) {
    // Estado para usuários filtrados
    const [filteredUsers, setFilteredUsers] = useState(users);
    const [filters, setFilters] = useState({});

    const t = useTranslations(lang);

    return (
        <section class="grid gap-8 h-fit">
            {/* Filtro */}
            {userType === "staff" ? (
                <UserFilter
                    users={users}
                    setFilteredUsers={setFilteredUsers}
                    setFilters={setFilters}
                    t={t}
                />
            ) : (
                null
            )}

            {/* Tabela */}
            <UserTable users={filteredUsers} userType={userType} activeFilters={filters} lang={lang} t={t} />
        </section>
    );
}
