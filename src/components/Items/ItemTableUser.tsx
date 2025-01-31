import { useEffect, useState } from "preact/hooks";
import { sanitizeName } from "@lib/functions"
import Availability from "./Availability";

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

export default function ItemTableForUser({ items, rentals, lang, layoutDirection, width, height }: { items: Item[], rentals: any, lang: string, layoutDirection: any, width: string, height?: any }) {
    const [data, setData] = useState<any[]>([]);

    //console.log("items:", items)

    useEffect(() => {
        // Cria uma lista de itens com informações do rental quando aplicável
        /*   const mergedData = items.map((item) => {
              const relatedRental = rentals.find((rental: { article_id: number; }) => rental.article_id === item.id);
              return relatedRental
                  ? { ...item, rental: relatedRental, hasRental: true } // Marca itens com rental relacionado
                  : { ...item, hasRental: false }; // Marca itens sem rental relacionado
          });
  
          setData(mergedData); */

        const mergedData: any[] = items.map((item: any) => {
            const relatedRentals = rentals.filter(
                (rental: any) => rental.article_id === item.id,
            );

            return relatedRentals.length > 0
                ? { ...item, rental: relatedRentals, hasRental: true } // Inclui todos os rentals relacionados
                : { ...item, rental: [], hasRental: false }; // Marca itens sem rentals
        });
        setData(mergedData);
    }, [items, rentals]);


    //console.log("data:", data)

    return (
        <div className={`${layoutDirection === "horizontal" ? "overflow-x-auto overflow-y-hidden whitespace-nowrap h-full" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-9"}`}>
            {data.length === 0 ? (
                <div
                    style={`width: ${width}`}
                    className={`py-3 px-4 text-center h-full`}>No items available.</div>
            ) : (
                data.map((entry) => (
                    <div
                        key={entry.id}
                        style={`width: ${width}; ${layoutDirection === "horizontal" ? "" : `height: ${height};`}`}
                        className={`relative ${layoutDirection === "horizontal" ? "inline-block mx-2 h-full" : "mx-auto max-w-sm"}  shadow-lg rounded-lg overflow-hidden border border-gray-300`}
                    >
                        {/* Image Section */}
                        {entry.image && (
                            <div className="absolute inset-0">
                                <div style={`view-transition-name: item-${entry.id}`} className="h-full">
                                    <a href={`/${lang}/clothes/${sanitizeName(entry.name)}?id=${entry.id}`}>
                                        <img
                                            src={entry.image}
                                            alt="Item image"
                                            className={`w-full h-full object-cover overflow-hidden ${layoutDirection === "vertical" ? "hover:scale-110 hover:saturate-150 hover:translate-y-[25px]" : "hover:scale-105 hover:saturate-150"} transition-transform duration-200 ease-in-out`}
                                        />
                                    </a>

                                    {/* Availability Badge */}
                                    <Availability entry={entry} />
                                </div>

                                <div className="absolute top-2 right-2 flex flex-col gap-2 items-center">
                                    {/* Size*/}
                                    <div className="px-3 py-1 bg-black text-white rounded-full text-xs">{entry.size}</div>

                                    {/* Color*/}
                                    <div className="right-2 flex gap-1">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{
                                                backgroundColor: entry.color,
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
                                <h3 className="text-base font-semibold truncate">{entry.name}</h3>
                                <p style="font-family:cursive" className="text-lg font-bold text-[--color2]">{entry.rental_price} €</p>
                            </div>

                            {/* Cart Button */}
                            <button
                                id={`add-to-cart-${entry.id}`}
                                className="w-12 h-12 flex items-center justify-center bg-[--color2] rounded-full shadow-lg hover: hover:text-[--color2] transition-colors duration-200 ease-in-out"
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
