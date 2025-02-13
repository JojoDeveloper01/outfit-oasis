interface CardLayoutProps {
    children: preact.ComponentChildren;
    layoutDirection: string;
    style?: string;
    className?: string;
}

export default function CardLayout({ children, layoutDirection, style = "", className = "" }: CardLayoutProps) {
    const baseStyles = {
        horizontal: "flex overflow-x-auto overflow-y-hidden whitespace-nowrap h-full gap-[1vw]",
        vertical: "flex flex-wrap gap-[2vw] mt-[2.3vw]"
    };

    const scrollStyles = {
        horizontal: "min-width: 100%; -webkit-overflow-scrolling: touch;",
        vertical: ""
    };

    return (
        <div
            className={`${baseStyles[layoutDirection as keyof typeof baseStyles]} ${className}`}
            style={`${scrollStyles[layoutDirection as keyof typeof scrollStyles]} ${style}`}
        >
            {children}
        </div>
    );
}