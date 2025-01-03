import { useState, useEffect } from "preact/hooks";

const PreviewImage = ({ src, type }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null; // Evita renderizar no SSR

    return (
        <dialog
            id={`preview-${type}-image-${src}`}
            className="p-0 bg-white rounded-lg shadow-lg max-w-md w-full overflow-hidden"
        >
            <div className="h-full flex flex-col items-center text-center">
                <div className="w-full flex justify-end py-2 pr-4 text-xl bg-gray-100">
                    <button
                        className="w-6 h-6 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white p-4 cursor-pointer outline-none"
                        onClick={(e) => e.currentTarget.closest("dialog").close()}
                    >
                        &times;
                    </button>
                </div>
                <img
                    src={src}
                    alt="Image Preview"
                    className="w-full object-contain h-full"
                />
            </div>
        </dialog>
    );
};

export default PreviewImage;

