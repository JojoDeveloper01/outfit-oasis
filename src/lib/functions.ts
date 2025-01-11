import { loadStripe } from '@stripe/stripe-js';
import { confetti } from "tsparticles-confetti";

//client
export const stripe = await loadStripe(
    "pk_test_51Qe20MQiiUMPEnxK0iI0rdoNI2ypnoGNTrna9PadMTbptmaQCoB8tVwiWfi1DxD783Uqq69yRVr5Sq1ytDTZCmmA001BOcIb1X",
) || null;

export const sanitizeName = (text: string) => {
    const sanitizedText = text
        .replace(/[^a-z0-9]+/gi, '-') // Substitui caracteres especiais por '-'
        .replace(/^-+|-+$/g, '')      // Remove '-' do início ou fim
        .toLowerCase();

    return sanitizedText;
};

//obter cookie no cliente
export function getCookie(name: any) {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === name) {
            return decodeURIComponent(value);
        }
    }
    return null; // Retorna null se o cookie não for encontrado
}

export function removeItemFromCart(itemId: number) {
    const cart = JSON.parse(sessionStorage.getItem("cart") || "[]") || [];
    //console.log("Carrinho antes da remoção:", cart);

    // Converter `item.id` para número para garantir a comparação correta
    const updatedCart = cart.filter((item: { id: string | number }) => Number(item.id) !== itemId);

    sessionStorage.setItem("cart", JSON.stringify(updatedCart));

    //console.log("Carrinho após a remoção:", updatedCart);
}

export const getTotalPriceFromURL = (param: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    return parseFloat(urlParams.get(param) || '0'); // Obtém o valor como número
}

// Função para disparar o confete
export function triggerConfetti() {
    const count = 200;
    const defaults = {
        origin: { y: 0.7 },
    };

    function fire(
        particleRatio: number,
        opts: {
            spread: number;
            startVelocity?: number;
            decay?: number;
            scalar?: number;
        },
    ) {
        confetti(
            Object.assign({}, defaults, opts, {
                particleCount: Math.floor(count * particleRatio),
            }),
        );
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });

    fire(0.2, {
        spread: 60,
    });

    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
}