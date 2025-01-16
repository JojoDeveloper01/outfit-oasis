import type { FunctionalComponent } from "preact";

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

const Availability: FunctionalComponent<{ entry: Entry }> = ({ entry }) => {
    function formatDate(date: string): string {
        const parsedDate = new Date(date);
        return parsedDate.toLocaleDateString("pt-PT", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }

    const rentals = Array.isArray(entry.rental) ? entry.rental : entry.rental ? [entry.rental] : [];
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Ordenar reservas por `start_date`
    const sortedRentals = rentals
        .filter((rental) => rental.start_date && rental.end_date)
        .sort((a, b) => new Date(a.start_date!).getTime() - new Date(b.start_date!).getTime());

    const lastUnavailableDate = (() => {
        let currentEndDate: Date | null = null;

        for (const rental of sortedRentals) {
            const startDate = new Date(rental.start_date!);
            const endDate = new Date(rental.end_date!);

            //console.log("startDate: ", startDate.getTime());
            //console.log("endDate: ", endDate.getTime());
            //console.log("currentEndDate (antes): ", currentEndDate);

            // Caso "startDate" e "endDate" sejam iguais (reserva de um único dia)
            if (startDate.getTime() === endDate.getTime()) {
                currentEndDate = endDate; // Atualiza currentEndDate diretamente
                //console.log("Reserva de um único dia detectada. currentEndDate atualizado para: ", currentEndDate);
                continue; // Passa para a próxima iteração
            }

            // Caso "amanhã" esteja dentro da reserva ou a reserva seja consecutiva
            if (
                (tomorrow >= startDate && tomorrow <= endDate) || // Amanhã está na reserva
                (currentEndDate !== null && startDate.getTime() <= currentEndDate.getTime() + 24 * 60 * 60 * 1000) // A reserva é consecutiva
            ) {
                // Atualiza o último dia de indisponibilidade
                currentEndDate = currentEndDate
                    ? new Date(Math.max(currentEndDate.getTime(), endDate.getTime())) // Mescla as reservas contínuas
                    : endDate;

                //console.log("currentEndDate (atualizado): ", currentEndDate);
            } else if (currentEndDate && startDate.getTime() > currentEndDate.getTime() + 24 * 60 * 60 * 1000) {
                // Existe um intervalo real, então paramos aqui
                //console.log("Intervalo detectado. Encerrando loop.");
                break;
            }
        }

        //console.log("Final currentEndDate: ", currentEndDate);
        return currentEndDate;
    })();

    //console.log("lastUnavailableDate: ", lastUnavailableDate)

    return (
        <div
            id={`availability-${entry.id}`}
            data-availability={lastUnavailableDate ? "reserved" : "available"}
            className={`absolute top-2 left-2 px-3 py-1 text-xs font-bold uppercase rounded-lg z-10 ${lastUnavailableDate ? "bg-[--color3] text-white" : "bg-[--teal] text-white"
                }`}
            style={{ boxShadow: "0 2px 24px 4px rgb(85 85 85 / 43%)" }}
        >
            {lastUnavailableDate
                ? `Reserved until ${formatDate(lastUnavailableDate.toISOString().split("T")[0])}`
                : "Available"}
        </div>
    );
};

export default Availability;