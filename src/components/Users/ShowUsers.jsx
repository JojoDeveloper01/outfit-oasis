import { useState } from "preact/hooks";
import PreviewImage from "@components/Modal/PreviewImage";

export default function ShowUsers({ users }) {
    const [data, setData] = useState(users); // Estado dos usuários

    //console.log(data);
    return (
        <table class="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead class="bg-gray-50">
                <tr
                    class="*:py-2 *:px-4 *:text-left *:text-sm *:font-semibold *:text-gray-600 *:border-b *:border-gray-200"
                >
                    <th>Profile Picture</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>User Type</th>
                    <th>Phone</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                {
                    data.length === 0 ? (
                        <div class="py-3 px-4 ml-4">No Users available.</div>
                    ) : (
                        data.map((user) => (
                            <tr class="hover:bg-gray-100">
                                <td class="py-3 px-4">
                                    <PreviewImage
                                        src={user.profile_pic}
                                        type="profile"
                                    />
                                    <img
                                        onclick={`document.getElementById('preview-profile-image-${user.profile_pic}').showModal()`}
                                        src={user.profile_pic}
                                        alt="Profile"
                                        class="h-10 w-10 rounded-full object-cover cursor-pointer"
                                    />
                                </td>

                                {["name", "email", "user_type", "phone"].map(
                                    (field) => (
                                        <td class="py-3 px-4 text-sm text-gray-600 relative">
                                            <div class="relative flex items-stretch gap-2 min-w-32 max-w-64">
                                                {/* Campo editável */}
                                                <div class="w-4/5 *:m-0">
                                                    {field === "user_type" ? (
                                                        <p
                                                            id={`${user.id}-${field}`}
                                                        >
                                                            {user[field] || ""}
                                                        </p>
                                                    ) : (
                                                        <p
                                                            id={`${user.id}-${field}`}
                                                        >
                                                            {user[field] || ""}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    ),
                                )}
                            </tr>
                        ))
                    )
                }
            </tbody>
        </table>
    );
}
