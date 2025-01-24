import { useState, useEffect, useRef } from 'preact/hooks';
import { actions } from 'astro:actions';
import type { ChatBoxProps } from '@lib/functions';

export function ChatBox({
    user,
    initialMessages,
    receiverId,
}: ChatBoxProps) {
    const [messages, setMessages] = useState(initialMessages); // Estado local de mensagens
    const [content, setContent] = useState(''); // Estado do input
    const chatBoxRef = useRef<HTMLDivElement>(null); // Referência para o container

    useEffect(() => {
        if (chatBoxRef.current) {
            setTimeout(() => {
                chatBoxRef.current?.scrollTo({
                    top: chatBoxRef.current.scrollHeight,
                    behavior: 'smooth',
                });
            }, 0); // 0ms para esperar o ciclo de renderização
        }
    }, [messages]);

    // Enviar mensagem
    async function handleSubmit(e: any) {
        e.preventDefault();


        const trimmed = content.trim();

        console.log(trimmed);
        if (!trimmed) {
            return alert('Por favor, digite uma mensagem.');
        }

        const { data, error } = await actions.sendMessage({
            senderId: user.id,
            receiverId,
            content: trimmed,
        });

        console.log(data, error);

        if (data?.success) {
            setMessages((prev: any) => [...prev, data]); // Adiciona nova mensagem
            setContent(''); // Limpa o input
        } else {
            alert('Erro ao enviar mensagem.');
            console.error(error);
        }
    }

    return (
        <div>
            <div
                ref={chatBoxRef}
                class="chat-box overflow-y-auto border border-gray-300 rounded-lg bg-white p-4 h-96"
            >
                <ul class="space-y-4">
                    {messages && messages.length ? (
                        messages.map((msg) => (
                            <div
                                class={`w-full flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'
                                    }`}
                            >
                                <li
                                    class={`chat-message ${msg.sender_id === user.id
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-black'
                                        } relative w-auto max-w-[70%] px-4 py-2 rounded-lg ${msg.sender_id === user.id
                                            ? 'rounded-br-none'
                                            : 'rounded-bl-none'
                                        }`}
                                >
                                    <span class="max-w-56 block break-words mr-8 mb-2">
                                        {msg.content}
                                    </span>
                                    <em class="text-sm text-white opacity-70 absolute bottom-1 right-2">
                                        {msg.created_at
                                            ? new Date(msg.created_at).toLocaleTimeString([], {
                                                hour: 'numeric',
                                                minute: '2-digit',
                                            })
                                            : ''}
                                    </em>
                                </li>
                            </div>
                        ))
                    ) : (
                        <p class="text-gray-500 text-center">
                            Nenhuma mensagem ainda.
                        </p>
                    )}
                </ul>
            </div>

            <form onSubmit={handleSubmit} class="flex items-center gap-2 mt-2">
                <textarea
                    class="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring focus:ring-blue-300"
                    placeholder="Digite sua mensagem..."
                    value={content}
                    onInput={(e) => setContent((e.target as HTMLTextAreaElement).value)}
                />
                <button
                    type="submit"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                    Enviar
                </button>
            </form>
        </div>
    );
}
