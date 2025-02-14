import { sanitizeName } from "@lib/functions";
import Availability from "./Availability";

interface CardBaseProps {
    width: string;
    height?: string;
    layoutDirection: string;
    entry?: any; // Tornar entry opcional
    lang?: string; // Tornar lang opcional
    className?: string;
    style?: string;
    children?: preact.ComponentChildren; // Adicionar children opcional
    isLoading?: boolean; // Adicionar prop para controlar o comportamento
}

export default function CardBase({
    width,
    height,
    layoutDirection,
    entry,
    lang,
    className = "",
    style = "",
    children,
    isLoading = false
}: CardBaseProps) {
    const baseStyles = {
        horizontal: "flex-shrink-0 h-full",
        vertical: ""
    };

    // Se estiver em loading, retorna apenas o container com children
    if (isLoading) {
        return (
            <div
                style={`width: ${width}; ${layoutDirection === "horizontal" ? "" : `height: ${height};`} ${style}`}
                className={`relative ${baseStyles[layoutDirection as keyof typeof baseStyles]} shadow-lg rounded-lg overflow-hidden ${className}`}
            >
                {children}
            </div>
        );
    }

    // Se não estiver em loading e não tiver entry, não renderiza nada
    if (!entry) return null;

    return (
        <div
            style={`width: ${width}; ${layoutDirection === "horizontal" ? "" : `height: ${height};`} ${style}`}
            className={`relative group ${baseStyles[layoutDirection as keyof typeof baseStyles]} shadow-lg rounded-lg overflow-hidden ${className}`}
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

                    <div className="absolute top-[.7vw] right-2 flex flex-col gap-[.7vw] items-center">
                        {/* Size*/}
                        <div className="px-[.8vw] py-[.3vw] bg-black text-white rounded-full text-[.9vw]">{entry.size}</div>

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
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/30 to-black/80 text-white px-[1vw] pt-[1vw] pb-3 flex gap-[1vw] justify-around opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Title and Price */}
                <div className="grid">
                    <h3 className="text-base font-semibold truncate">{entry.name}</h3>
                    <p style="font-family:cursive" className="text-[1.2vw] font-bold text-[--gold]">{entry.rental_price} €</p>
                </div>

                {/* Cart Button */}
                <button
                    id={`add-to-cart-${entry.id}`}
                    className="size-12 flex items-center justify-center bg-[--color-black] rounded-full shadow-lg transition-colors duration-200 ease-in-out hover:bg-white hover:text-black"
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
    );
}