import CardBase from "./CardBase";
import CardLayout from "./CardLayout";

interface LoadingCardProps {
    count: number;
    width: string;
    height: string;
    layoutDirection: 'horizontal' | 'vertical';
}

export default function LoadingCard({ count, width, height, layoutDirection }: LoadingCardProps) {
    const cards = Array.from({ length: count });

    return (
        <CardLayout layoutDirection={layoutDirection}>
            {cards.map((_, index) => (
                <CardBase
                    key={index}
                    width={width}
                    height={height}
                    layoutDirection={layoutDirection}
                    className="animate-pulse"
                    isLoading={true}
                >
                    <div className="absolute inset-0 bg-gray-200"></div>
                </CardBase>
            ))}
        </CardLayout>
    );
}