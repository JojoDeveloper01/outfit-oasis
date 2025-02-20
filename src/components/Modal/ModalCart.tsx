import { useState, useEffect } from "preact/hooks";
import { actions } from "astro:actions";
import { getCookie, sanitizeName } from "@lib/functions";
import { useTranslations } from "@i18n/utils";

interface CartProps {
  lang: "en" | "pt" | "es";
}

const Cart = ({ lang }: CartProps) => {
  interface CartItem {
    id: string;
    name: string;
    image: string;
    price: number;
    size: string;
    color: string;
    availability: boolean;
  }

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState("");

  const t = useTranslations(lang) as (key: "nav.home" | "nav.dashboard" | "nav.clothes" | "nav.analytics" | "nav.users" | "nav.items" | "nav.historical" | "nav.logout" | "cart.shoppingCart" | "cart.day" | "cart.rent" | "cart.total" | `color.${"red" | "blue" | "green" | "yellow" | "black" | "white"}`) => string;

  useEffect(() => {
    const storedCart = JSON.parse(sessionStorage.getItem("cart") || "[]");
    setCart(storedCart);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);


  useEffect(() => {
    setUserId(getCookie("id") || "");
  }, []);

  useEffect(() => {
    const handleClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = target?.closest('button[id^="add-to-cart-"]');
      if (button) {
        const itemId = button.id.replace("add-to-cart-", "");
        if (!cart.some((item) => item.id === itemId)) {
          const item = await fetchItemById(itemId);
          if (item) {
            setCart((prevCart: any) => {
              const updatedCart = [...prevCart, item];
              sessionStorage.setItem("cart", JSON.stringify(updatedCart));
              return updatedCart;
            });
          }
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [cart]);

  const fetchItemById = async (id: string) => {
    try {
      const { data, error } = await actions.getItemID({ id: Number(id) });
      if (error || !data) throw new Error("Item not found");
      return {
        id: String(data.id),
        name: String(data.name),
        image: String(data.image),
        price: Number(data.rental_price),
        size: String(data.size),
        color: String(data.color),
        availability: data.availability,
      };
    } catch (error) {
      console.error("Error fetching item:", error);
      return null;
    }
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.id !== id);
      sessionStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const totalValue = cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
  const isUser = userId ? "modalRent" : "modalLogin";

  const handleButtonClick = () => {
    if (!isLoading && cart.length > 0) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div class="relative mr-[1vw] z-50">
      {/* Cart Button */}
      <button
        onClick={handleButtonClick}
        class={`relative size-[2.2vw] rounded-full flex items-center justify-center ${isLoading
          ? "bg-[--color-white] text-[--gold] cursor-not-allowed animate-pulse"
          : "bg-[--gold] text-black hover:bg-[--color-white1] hover:text-black"
          }`}
        disabled={isLoading} // Desabilita o botão quando carregando ou vazio
      >
        <span class={`${isLoading ? 'hidden' : ''} absolute w-[60%] h-[40%] -top-[14%] -right-[26%] rounded-full text-black font-bold text-[.7vw] bg-white`}>
          {cart.length}
        </span>
        <svg
          class={`${isLoading ? 'hidden' : ''} size-[70%]`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M4 19a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
          <path d="M12.5 17h-6.5v-14h-2" />
          <path d="M6 5l14 1l-.86 6.017m-2.64 .983h-10.5" />
          <path d="M16 19h6" />
          <path d="M19 16v6" />
        </svg>
      </button>

      {/* Cart Modal */}
      {isOpen && cart.length > 0 && (
        <div class="min-h-[10vw] max-h-[33vw] absolute top-full right-0 mt-[.6vw] w-[25vw] rounded-lg shadow-lg border border-gray-300 bg-[--gray] text-white overflow-y-auto">
          <div class="p-[1vw] border-b"><h3 class="text-[1vw] font-semibold">{t("cart.shoppingCart")}</h3></div>
          <div class="h-full overflow-y-auto">

            {cart.map((item, index) => (
              <div key={`${item.id}-${index}`} class="flex items-center p-[.7vw] hover:bg-[--grayLight]">
                <a href={`/${lang}/clothes/${sanitizeName(item.name)}?id=${item.id}`}>
                  <img src={item.image} alt={item.name} class="w-16 h-full object-cover rounded-lg border" />
                </a>
                <div class="relative ml-4 flex-1">
                  <span class={`absolute top-[.7vw] right-1 w-3 h-3 ${item.availability ? "bg-[--color-black]" : "bg-[--greenBlack]"} rounded-full shadow-lg`}></span>
                  <a href={`/${lang}/clothes/${sanitizeName(item.name)}?id=${item.id}`} class="pr-4 text-[.8vw] font-medium text-white">
                    {item.name}
                  </a>
                  <p class="text-[1vw] font-extralight">{item.size} | {t(`color.${item.color as "red" | "blue" | "green" | "yellow" | "black" | "white"}`)}</p>
                  <div class="flex items-center justify-between mt-1">
                    <span class="text-[.8vw] font-bold">{item.price.toFixed(2)} €/{t("cart.day")}</span>
                    <div class="flex items-center gap-[.7vw]">
                      <button onClick={() => removeFromCart(item.id)} class="text-red-500 text-[.8vw] px-2 py-[.3vw] hover:bg-red-100">
                        ✖
                      </button>
                      <button onClick={() => {
                        const modal = document.getElementById(isUser);
                        if (modal) (modal as HTMLDialogElement).showModal();
                      }} class="text-green-500 text-[.8vw] px-2 py-[.3vw] hover:bg-green-100"
                        data-rent={item.id}>
                        {t("cart.rent")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div class="sticky bottom-0 w-full p-[1vw] border-t flex justify-between items-center bg-[--gray]">
            <span class="text-[.8] font-medium">{t("cart.total")}:</span>
            <div class="text-[1vw] font-bold">{totalValue} €</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;