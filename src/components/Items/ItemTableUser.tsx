import { useEffect, useState } from "preact/hooks";
import LoadingCard from "./LoadingCard";
import CardBase from "./CardBase";
import CardLayout from "./CardLayout";
import type { Item } from "@lib/functions";

export default function ItemTableForUser({ items, rentals, lang, layoutDirection, width, height }: { items: Item[], rentals: any, lang: string, layoutDirection: any, width: string, height?: any }) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    //console.log("items:", items)

    useEffect(() => {
        setLoading(true);

        const mergedData: any[] = items.map((item: any) => {
            const relatedRentals = rentals.filter(
                (rental: any) => rental.article_id === item.id,
            );

            return relatedRentals.length > 0
                ? { ...item, rental: relatedRentals, hasRental: true } // Inclui todos os rentals relacionados
                : { ...item, rental: [], hasRental: false }; // Marca itens sem rentals
        });
        setData(mergedData);
        setLoading(false);
    }, [items, rentals]);


    //console.log("data:", data)

    return (
        loading ? (
            <LoadingCard count={items.length} width={width} height={height} layoutDirection={layoutDirection} />
        ) : data.length === 0 ? (
            <div
                style={`width: ${width}`}
                className={`py-[.8vw] px-[1vw] text-center min-h-96 h-full`}
            >
                No items available.
            </div>
        ) :
            (
                <CardLayout layoutDirection={layoutDirection}>
                    {data.map((entry) => (
                        <CardBase
                            key={entry.id}
                            width={width}
                            height={height}
                            layoutDirection={layoutDirection}
                            entry={entry}
                            lang={lang}
                            isLoading={false}
                        />
                    ))}
                </CardLayout>
            )
    );
}
