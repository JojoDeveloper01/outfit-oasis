import { isCurrentlyRented } from "@lib/functions";

interface Entry {
    id: number
    rental?: {
        start_date?: string;
        end_date?: string;
    };
}

export default function Availability({ entry }: { entry: Entry }) {
    // Formata a data para exibição (podes ajustar o formato)
    function formatDate(date: string): string {
        const parsedDate = new Date(date);
        return parsedDate.toLocaleDateString("pt-PT", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }

    const start: any = entry.rental?.start_date
    const end: any = entry.rental?.end_date

    return (
        <div
            id={`availability-${entry.id}`}
            data-availability={isCurrentlyRented(start, end)}
            className={
                `absolute top-2 left-2 px-3 py-1 text-xs font-bold uppercase rounded-lg z-10 ${entry.rental && start && end
                    ? isCurrentlyRented(start, end)
                        ? "bg-[--color5] text-white" // Indisponível
                        : "bg-[--color3] text-white" // Disponível em breve
                    : "bg-[--teal] text-white" // Disponível
                }`}
            style={{ boxShadow: "0 2px 24px 4px rgb(85 85 85 / 43%)" }}
        >
            {entry.rental && start && end
                ? isCurrentlyRented(start, end)
                    ? `Reserved until ${formatDate(end)}`
                    : `Available after ${formatDate(end)}`
                : "Available"}
        </div>)
}