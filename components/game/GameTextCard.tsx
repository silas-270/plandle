type Props = {
    text: string;
    isBuffering: boolean;
};

export default function GameTextCard({ text, isBuffering }: Props) {
    return (
        <div className="w-full h-52 sm:h-96 bg-brand-muted relative overflow-hidden flex items-center justify-center p-6 text-center">
            {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-bg-subtle/80 z-10 text-brand-base font-bold animate-pulse">
                    Loading next question...
                </div>
            )}
            {text && (
                <p className="text-xl sm:text-3xl font-bold text-text-header leading-relaxed max-w-2xl">
                    {text}
                </p>
            )}
        </div>
    );
}
