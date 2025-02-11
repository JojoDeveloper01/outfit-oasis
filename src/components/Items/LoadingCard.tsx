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
                : "flex flex-wrap gap-[2vw] mt-[2.3vw]"
                }`}
        >
            {cards.map((_, index) => (
                <div
                    key={index}
                    style={`width: ${width}; ${layoutDirection === "horizontal" ? "" : `height: ${height};`
                        }`}
                    className={`relative ${layoutDirection === "horizontal" ? "inline-block h-full" : ""
                        } shadow-lg rounded-lg overflow-hidden border border-gray-300 animate-pulse`}
                >
                    <div className="absolute inset-0 bg-gray-200"></div>
                </div>
            ))}
        </div>
    );
}