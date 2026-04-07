type Props = {
    src: string;
    scale: number;
    isBuffering: boolean;
};

export default function GameImage({ src, scale, isBuffering }: Props) {
    return (
        <div className="w-full h-52 sm:h-96 bg-bg-soft relative overflow-hidden">
            {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-bg-subtle/80 z-10 text-brand-base font-bold animate-pulse">
                    Loading next aircraft...
                </div>
            )}
            {src && (
                <img
                    key={src}
                    src={src}
                    alt="Guess the aircraft"
                    className="object-contain w-full h-full transition-all duration-700 ease-in-out"
                    style={{ transform: `scale(${scale})` }}
                />
            )}
        </div>
    );
}
