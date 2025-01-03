import { useEffect, useState } from "preact/hooks";

interface Item {
    id: number;
    name: string;
    category: string;
    type: string;
    size: string;
    color: string;
    brand: string;
    condition: string;
    rental_price: number;
    image?: string;
    availability: number;
}

function sanitizeName(name: string) {
    if (!name) return "";
    return name
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "")
        .toLowerCase()
}

export default function ItemTableForUser({ items }: { items: Item[] }) {
    const [data, setData] = useState(items);

    useEffect(() => {
        setData(items); // Sync with the provided `items` prop
    }, [items]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {data.length === 0 ? (
                <div className="py-3 px-4 text-center">No items available.</div>
            ) : (
                data.map((item) => (
                    <div
                        key={item.id}
                        className="relative w-full h-[34rem] max-w-sm mx-auto bg-white shadow-lg rounded-lg overflow-hidden border border-gray-300"
                    >
                        {/* Image Section */}
                        {item.image && (
                            <div className="absolute inset-0">
                                <a href={`/clothes/${sanitizeName(item.name)}`}>
                                    <img
                                        src={item.image}
                                        alt="Item image"
                                        className="w-full h-full object-cover"
                                    />
                                </a>
                                {/* Availability Badge */}
                                <div
                                    className={`absolute top-2 left-2 px-3 py-1 text-xs font-bold uppercase rounded-lg ${item.availability
                                        ? "bg-green-500 text-white"
                                        : "bg-orange-500 text-white"
                                        }`}
                                >
                                    {item.availability ? "Available" : "Reserved"}
                                </div>
                                {/* Color Options */}
                                {item.color && (
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{
                                                backgroundColor: item.color,
                                                boxShadow: "0 0 2px 2px rgb(0 0 0 / 24%)",
                                            }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Bottom Info Section */}
                        <div className="absolute bottom-0 w-full bg-gradient-to-t from-white/60 to-black/70 text-white px-4 pt-4 pb-3 flex flex-col items-center">
                            <h3 className="text-base font-semibold truncate">
                                {item.name}
                            </h3>
                            <p className="text-lg font-bold mt-1 ">{item.rental_price} €</p>
                            {item.size && (
                                <div className="mt-2 px-3 py-1 bg-black/40 rounded-full text-xs">
                                    {item.size}
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
