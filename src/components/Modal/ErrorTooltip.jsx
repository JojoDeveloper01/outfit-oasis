import { useEffect, useRef } from "preact/hooks";

export default function ErrorTooltip({ id, message }) {
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (tooltipRef.current) {
      tooltipRef.current.style.display = message ? "block" : "none";
    }
  }, [message]);// Reexecuta quando `message` mudar

  return (
    <div id={`tooltip-${id}`}
      ref={tooltipRef} class="absolute bottom-[-2rem] w-56 rounded bg-[#e57272] p-3 text-xs text-white shadow-md before:absolute before:-top-[10px] before:left-[10px] before:border-[5px] before:border-transparent before:border-b-red-500/80 z-10">
      {/* Tooltip de erro */}
      {message}
    </div>
  );
}