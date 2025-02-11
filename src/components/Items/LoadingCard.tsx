interface LoadingCardProps {
    count: number;
    width: string;
    height: string;
    layoutDirection: string;
}

export default function LoadingCard({ count, width, height, layoutDirection }: LoadingCardProps) {
    const cards = Array.from({ length: count });

    return (
        <div
            className={`${layoutDirection === "horizontal"
                ? "overflow-x-auto overflow-y-hidden whitespace-nowrap h-full"
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-9"
                }`}
        >
            {cards.map((_, index) => (
                <div
                    key={index}
                    style={`width: ${width}; ${layoutDirection === "horizontal" ? "" : `height: ${height};`
                        }`}
                    className={`relative ${layoutDirection === "horizontal" ? "inline-block mx-2 h-full" : "mx-auto"
                        } shadow-lg rounded-lg overflow-hidden border border-gray-300 animate-pulse`}
                >
                    <div className="absolute inset-0 bg-gray-200"></div>
                </div>
            ))}
        </div>
    );
}