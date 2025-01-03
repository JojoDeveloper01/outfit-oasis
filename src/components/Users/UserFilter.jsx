import { useState, useEffect } from "preact/hooks";

const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

export default function UserFilter({ users, setFilteredUsers, setFilters }) {
    const [search, setSearch] = useState("");
    const [type, setType] = useState("");

    useEffect(() => {
        const handleFilter = debounce(() => {
            const filtered = users.filter((user) => {
                const matchesSearch =
                    user.name.toLowerCase().includes(search.toLowerCase()) ||
                    user.email.toLowerCase().includes(search.toLowerCase()) ||
                    (user.phone && user.phone.toString().includes(search));

                const matchesType = type ? user.user_type === type : true;

                return matchesSearch && matchesType;
            });

            setFilteredUsers(filtered);
            setFilters({ search, user_type: type });
        }, 300); // 300ms de debounce

        handleFilter();
    }, [search, type]); // Reexecuta ao alterar `search` ou `type`

    return (
        <div className="grid gap-4 bg-white p-4 rounded-lg shadow-md">
            <div className="flex gap-4">
                <input
                    id="user-search"
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onInput={(e) => setSearch(e.target.value)}
                    className="border p-2"
                />
                <select
                    id="userType-search"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="border p-2"
                >
                    <option value="">All Types</option>
                    <option value="client">Client</option>
                    <option value="staff">Staff</option>
                </select>
            </div>
        </div>
    );
}
