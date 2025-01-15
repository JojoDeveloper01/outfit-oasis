interface Entry {
    id: number;
    rental?: {
        start_date?: string;
        end_date?: string;
    } | {
        start_date?: string;
        end_date?: string;
    }[];
}

export default function Availability({ entry }: { entry: Entry }) {
    // Função para formatar a data
    function formatDate(date: string): string {
        const parsedDate = new Date(date);
        return parsedDate.toLocaleDateString("pt-PT", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }

    console.log("entry", entry)

    // Garante que rental seja um array
    const rentals = Array.isArray(entry.rental) ? entry.rental : entry.rental ? [entry.rental] : [];
    const today = new Date();

    // Ordenar as reservas por `start_date` para garantir análise correta
    const sortedRentals = rentals.sort((a, b) => new Date(a.start_date!).getTime() - new Date(b.start_date!).getTime());

    console.log("sortedRentals: ", sortedRentals)

    // Encontrar a reserva ativa (se hoje estiver dentro de algum intervalo reservado)
    const activeRental = sortedRentals.find((rental) => {
        const startDate = new Date(rental.start_date!);
        const endDate = new Date(rental.end_date!);
        return today >= startDate && today <= endDate; // Reserva ativa agora
    });

    // Encontrar o próximo intervalo futuro disponível
    const nextAvailableRental = sortedRentals.find((rental) => new Date(rental.start_date!) > today);

    const isCurrentlyReserved = !!activeRental; // Está reservado agora
    const activeEnd: string | undefined = activeRental?.end_date; // Fim da reserva ativa
    const nextStart: string | undefined = nextAvailableRental?.start_date; // Início da próxima reserva futura

    return (
        <div
            id={`availability-${entry.id}`}
            data-availability={isCurrentlyReserved ? "reserved" : "available"}
            className={`absolute top-2 left-2 px-3 py-1 text-xs font-bold uppercase rounded-lg z-10 ${isCurrentlyReserved
                ? "bg-[--color5] text-white" // Indisponível
                : "bg-[--teal] text-white" // Disponível
                }`}
            style={{ boxShadow: "0 2px 24px 4px rgb(85 85 85 / 43%)" }}
        >
            {isCurrentlyReserved
                ? `Reserved until ${formatDate(activeEnd!)}`
                : nextStart
                    ? `Available until ${formatDate(nextStart)}`
                    : "Available"}
        </div>
    );
}
