import { useEffect, useState } from "preact/hooks";
import { sanitizeName } from "@lib/functions"
import { getLangFromUrl, useTranslations } from "@i18n/utils";

const lang = getLangFromUrl(new URL(window.location.href));
const t = useTranslations(lang);

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

export default function ItemTableForUser({ items }: { items: Item[] }) {
    /*   const addToCart = (id: number) => {
          console.log(`Item with id ${id} added to cart`);
          const broadcastChannel = new BroadcastChannel("cartChannel");
          broadcastChannel.postMessage(1); // Envia o ID do produto
      }; */
    const [data, setData] = useState(items);

    console.log("items: ", items)

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
                                <div style={`view-transition-name: item-${item.id}`} className="h-full">
                                    <a href={`/${lang}/clothes/${sanitizeName(item.name)}`}>
                                        <img
                                            src={item.image}
                                            alt="Item image"
                                            className="w-full h-full object-cover overflow-hidden hover:scale-110 hover:saturate-150 hover:translate-y-[25px] transition-transform duration-200 ease-in-out"
                                        />
                                    </a>

                                    {/* Availability Badge */}
                                    <div
                                        className={`absolute top-2 left-2 px-3 py-1 text-xs font-bold uppercase rounded-lg ${item.availability
                                            ? "bg-[--teal] text-white"
                                            : "bg-[--gold] text-white"
                                            }`}
                                        style={{ boxShadow: "0 2px 24px 4px rgb(85 85 85 / 43%)" }}
                                    >
                                        {item.availability ? "Available" : "Reserved"}
                                    </div>
                                </div>

                                <div className="absolute top-2 right-2 flex flex-col gap-2 items-center">
                                    {/* Size*/}
                                    <div className="px-3 py-1 bg-black text-white rounded-full text-xs">{item.size}</div>

                                    {/* Color*/}
                                    <div className=" right-2 flex gap-1">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{
                                                backgroundColor: item.color,
                                                boxShadow: "0 0 2px 2px rgb(0 0 0 / 24%)",
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Bottom Info Section */}
                        <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/30 to-black/80 text-white px-4 pt-4 pb-3 flex gap-4 justify-around">
                            {/* Title and Price */}
                            <div className="grid">
                                <h3 className="text-base font-semibold truncate">{item.name}</h3>
                                <p style="font-family:cursive" className="text-lg font-bold text-[--color2]">{item.rental_price} €</p>
                            </div>

                            {/* Cart Button */}
                            <button
                                id={`add-to-cart-${item.id}`}
                                className="w-12 h-12 flex items-center justify-center bg-[--color2] rounded-full shadow-lg hover:bg-white hover:text-[--color2] transition-colors duration-200 ease-in-out"
                                aria-label="Add to Cart"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    className="icon icon-tabler icons-tabler-outline icon-tabler-shopping-cart-plus"
                                >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M4 19a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                                    <path d="M12.5 17h-6.5v-14h-2" />
                                    <path d="M6 5l14 1l-.86 6.017m-2.64 .983h-10.5" />
                                    <path d="M16 19h6" />
                                    <path d="M19 16v6" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
