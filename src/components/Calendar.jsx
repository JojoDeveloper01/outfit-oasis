import { useState, useEffect } from 'preact/hooks';
import { getParamsFromURL } from "@lib/functions";

const Calendar = ({ itemsRent }) => {
  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 365);

  //console.log("itemsRent: ", itemsRent);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0 });
  const [pricePerDay, setPricePerDay] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [blockedDates, setBlockedDates] = useState([]);
  const [currentItemId, setCurrentItemId] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const formatDate = (date) =>
    `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

  const calculateIntervalDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const differenceInTime = end.getTime() - start.getTime();
    return Math.ceil(differenceInTime / (1000 * 3600 * 24));
  };

  const updateTotalPrice = (intervalDays) => {
    if (pricePerDay !== null) {
      let total;

      if (intervalDays === 0) {
        // Aplica o desconto de 20% para uso no mesmo dia
        total = pricePerDay * 0.8;
      } else {
        total = pricePerDay * intervalDays;
      }

      // Atualiza o estado do total
      setTotalPrice(total);

      // Atualiza o elemento DOM #itemPrice
      const itemPriceElement = document.getElementById("itemPrice");
      if (itemPriceElement) {
        itemPriceElement.textContent = `${total}`; // Atualiza o conteúdo do elemento
      }
    }
  };

  const handleDateSelection = () => {
    if (startDate && endDate) {
      const intervalDays = calculateIntervalDays(startDate, endDate);
      updateTotalPrice(intervalDays);
    }
  };

  const getTooltipText = (date) => {
    if (date <= today) return "Cannot select today or past.";
    if (date < minDate) return "Cannot rent on the same day.";
    if (date > maxDate) return "Cannot rent for over 1 year.";
    return null;
  };

  const handleDateClick = (date) => {
    if (date < minDate || date > maxDate) return;

    if (!startDate || (startDate && endDate)) {
      // Se não houver data de início ou se já houver um intervalo, reinicia a seleção
      setStartDate(date);
      setEndDate(null);
    } else if (startDate && date >= startDate) {
      // Verifica se o intervalo contém datas bloqueadas
      const intervalHasBlockedDates = blockedDates.some((blockedRange) => {
        const start = new Date(blockedRange.startDate);
        const end = new Date(blockedRange.endDate);
        return (
          (date >= start && date <= end) || // A data de término está em um intervalo bloqueado
          (startDate >= start && startDate <= end) || // A data de início está em um intervalo bloqueado
          (startDate < start && date > end) // O intervalo cobre um período bloqueado
        );
      });

      if (intervalHasBlockedDates) {
        // Se houver datas bloqueadas no intervalo, reinicia a seleção
        setStartDate(null);
        setEndDate(null);
      } else {
        // Caso contrário, define a data de término
        setEndDate(date);
      }
    } else {
      // Redefine a seleção caso o usuário clique em uma data anterior ao início
      setStartDate(date);
      setEndDate(null);
    }
    setHoverDate(null);
  };

  const handleMouseEnter = (date, event) => {
    const tooltipText = getTooltipText(date);
    if (tooltipText) {
      const tooltipX = event.clientX + 10;
      const tooltipY = event.clientY + 10;
      setTooltip({ visible: true, text: tooltipText, x: tooltipX, y: tooltipY });
    }

    // Verificar se o hover é permitido dentro dos limites
    if (startDate && !endDate && date >= startDate && date <= maxDate) {
      setHoverDate(date); // Atualiza o hover somente se estiver no limite permitido
    } else {
      setHoverDate(null); // Não permite hover fora dos limites
    }
  };

  const handleMouseMove = (event) => {
    const tooltipX = event.clientX + 10;
    const tooltipY = event.clientY + 10;
    setTooltip((prev) => ({ ...prev, x: tooltipX, y: tooltipY }));
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, text: '', x: 0, y: 0 });
    setHoverDate(null);
  };

  const isDateBlocked = (date) => {
    if (!Array.isArray(blockedDates) || blockedDates.length === 0) return false;

    return blockedDates.some((blockedRange) => {
      const start = new Date(blockedRange.startDate);
      const end = new Date(blockedRange.endDate);
      return date >= start && date <= end;
    });
  };

  const fetchRentalData = (itemId) => {
    const rentedItem = itemsRent.find((item) => item.id === parseInt(itemId, 10));

    // Limpa as datas selecionadas ao carregar um novo item
    setStartDate(null);
    setEndDate(null);

    if (rentedItem) {
      //console.log("rentedItem: ", rentedItem)
      if (rentedItem.rental) {
        //console.log("rentedItem.rental: ", rentedItem.rental)
        const blocked = Array.isArray(rentedItem.rental)
          ? rentedItem.rental.map((r) => ({
            startDate: r.start_date,
            endDate: r.end_date,
          }))
          : [
            {
              startDate: rentedItem.rental.start_date,
              endDate: rentedItem.rental.end_date,
            },
          ];

        // Substituir por datas específicas do item atual
        setBlockedDates(blocked);
      } else {
        // Caso o item não tenha nenhum aluguel, limpar as datas bloqueadas
        setBlockedDates([]);
      }
    }
  };

  useEffect(() => {
    const handleButtonClick = (event) => {
      const button = event.target.closest("button[data-rent]");
      if (button && button.getAttribute("data-rent")) {
        const itemId = button.getAttribute("data-rent");
        setCurrentItemId(itemId); // Atualiza o estado com o itemId clicado
        fetchRentalData(itemId); // Busca os dados de aluguel do item
      }
    };

    document.addEventListener("click", handleButtonClick);

    return () => {
      document.removeEventListener("click", handleButtonClick);
    };
  }, [itemsRent]);

  useEffect(() => {
    const totalPriceFromURL = getParamsFromURL("totalPrice");
    if (totalPriceFromURL) {
      setPricePerDay(parseFloat(totalPriceFromURL) || 0);
    }
  })

  useEffect(() => {
    // Habilita ou desabilita o botão "nextToStep2" com base em `endDate`
    const nextToStep2 = document.querySelector("#nextToStep2");
    if (nextToStep2) {
      nextToStep2.disabled = !endDate; // Desabilitado se `endDate` não existir
    }
  }, [endDate]);

  useEffect(() => {
    handleDateSelection();
  }, [startDate, endDate, pricePerDay]);

  return (
    <div class="flex flex-col gap-[1vw] justify-evenly w-full relative">
      <div class="flex justify-between items-center">
        <button
          class="text-blue-500 font-bold disabled:text-gray-400"
          onClick={() => setCurrentDate(new Date(year, month - 1))}
          disabled={year === today.getFullYear() && month === today.getMonth()}
        >
          &lt;
        </button>
        <h2 class="text-[1vw] max-[768px]:text-[1.5vw] font-semibold">{`${monthNames[month]} ${year}`}</h2>
        <button
          class="text-blue-500 font-bold disabled:text-gray-400"
          onClick={() => setCurrentDate(new Date(year, month + 1))}
          disabled={year === maxDate.getFullYear() && month === maxDate.getMonth()}
        >
          &gt;
        </button>
      </div>
      <div class="grid grid-cols-7 text-center text-gray-700 font-bold">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <span>{day}</span>
        ))}
      </div>
      <div class="grid grid-cols-7 gap-[.7vw] text-center">
        {[...Array(firstDay)].map(() => (
          <div></div>
        ))}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          const isDisabled = date < minDate || date > maxDate || isDateBlocked(date);
          const isSelected = startDate && endDate && date >= startDate && date <= endDate;
          const isHovered = startDate && !endDate && hoverDate && date >= startDate && date <= hoverDate;

          return (
            <div
              className={`p-[.7vw] rounded-md cursor-pointer ${isSelected
                ? "bg-blue-300"
                : isHovered
                  ? "bg-blue-100"
                  : isDisabled
                    ? "bg-gray-300"
                    : "bg-gray-200"
                } ${isDisabled ? "cursor-not-allowed" : "hover:bg-blue-100"}`}
              onClick={() => !isDisabled && handleDateClick(date)}
              onMouseEnter={(e) => handleMouseEnter(date, e)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {day}
            </div>
          );
        })}
      </div>
      {tooltip.visible && (
        <div
          class="tooltip absolute bg-[rgba(59,130,246,0.9)] text-[white] text-[1vw] shadow-[0_2px_6px_rgba(0,0,0,0.2)] z-[1000] pointer-events-none whitespace-nowrap hidden p-[.7vw] rounded-md;"
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            display: tooltip.visible ? 'block' : 'none',
          }}
        >
          {tooltip.text}
        </div>
      )}
      {startDate && endDate && (
        <div
          className="flex flex-wrap gap-x-2 text-lg font-semibold text-gray-700"
        >
          <span id="interval-date">{`${formatDate(startDate)} - ${formatDate(endDate)}`}</span>
          -
          <span>{`${calculateIntervalDays(startDate, endDate)} days x ${pricePerDay} €/day =`}
            <span id="totalPriceItem" className="ml-2 px-2 py-[.3vw] bg-gray-300 rounded-lg">{`${totalPrice}`}</span> €
          </span>
        </div>
      )}
    </div>
  );
};

export default Calendar;
