import { useState, useEffect } from 'preact/hooks';

const Calendar = () => {
  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0 });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const formatDate = (date) =>
    `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

  const getTooltipText = (date) => {
    if (date <= today) return "Cannot select today or past.";
    if (date < minDate) return "Cannot rent on the same day.";
    if (date > maxDate) return "Cannot rent for over 2 weeks.";
    return null;
  };

  const handleDateClick = (date) => {
    if (date < minDate || date > maxDate) return;

    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else if (startDate && date >= startDate) {
      setEndDate(date);
    } else {
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

  useEffect(() => {
    const nextToStep2 = document.querySelector("#nextToStep2");
    if (endDate) {
      if (nextToStep2) {
        nextToStep2.disabled = false;
      }
    } else {
      if (nextToStep2) {
        nextToStep2.disabled = true;
      }
    }
  }, [endDate]);

  return (
    <div class="flex flex-col gap-4 justify-evenly w-full h-[25rem] relative">
      <div class="flex justify-between items-center">
        <button
          class="text-blue-500 font-bold disabled:text-gray-400"
          onClick={() => setCurrentDate(new Date(year, month - 1))}
          disabled={year === today.getFullYear() && month === today.getMonth()}
        >
          &lt;
        </button>
        <h2 class="text-xl font-semibold">{`${monthNames[month]} ${year}`}</h2>
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
      <div class="grid grid-cols-7 gap-2 text-center">
        {[...Array(firstDay)].map(() => (
          <div></div>
        ))}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          const isDisabled = date < minDate || date > maxDate;
          const isSelected = startDate && endDate && date >= startDate && date <= endDate;
          const isHovered = startDate && !endDate && hoverDate && date >= startDate && date <= hoverDate;

          return (
            <div
              class={`p-2 rounded-md cursor-pointer ${isSelected
                ? 'bg-blue-300'
                : isHovered && date >= startDate && date <= maxDate // Limitar hover ao intervalo permitido
                  ? 'bg-blue-100'
                  : isDisabled
                    ? 'bg-gray-300'
                    : 'bg-gray-200'
                } ${isDisabled ? 'cursor-not-allowed' : 'hover:bg-blue-100'}`}
              onClick={() => handleDateClick(date)}
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
          class="tooltip absolute bg-[rgba(59,130,246,0.9)] text-[white] text-sm shadow-[0_2px_6px_rgba(0,0,0,0.2)] z-[1000] pointer-events-none whitespace-nowrap hidden p-2 rounded-md;"
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
        <div id='interval-date' class="text-lg font-semibold text-gray-700">
          {`${formatDate(startDate)} - ${formatDate(endDate)}`}
        </div>
      )}
    </div>
  );
};

export default Calendar;
