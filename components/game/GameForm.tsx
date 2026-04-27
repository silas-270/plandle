import { FieldConfig, GenericAnswer } from '@/types/genericGame';

type Props = {
    fields: FieldConfig[];
    selected: GenericAnswer;
    onFieldChange: (key: string, value: string) => void;
    isBuffering: boolean;
    isGameOver: boolean;
    remainingAttempts: number;
    onGuess: () => void;
    /** Slot for mode-specific extra buttons (e.g. Skip in Endless) */
    extraActions?: React.ReactNode;
};

const GRID_COLS: Record<number, string> = {
    1: '',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
};

export default function GameForm({
    fields, selected, onFieldChange,
    isBuffering, isGameOver, remainingAttempts, onGuess,
    extraActions,
}: Props) {
    const colClass = GRID_COLS[fields.length] ?? 'sm:grid-cols-3';

    return (
        <>
            {/* Dynamic field grid */}
            <div className={`grid grid-cols-1 ${colClass} gap-3 mb-4 sm:mb-8`}>
                {fields.map(field => (
                    <div key={field.key}>
                        <label className="block text-xs sm:text-sm font-semibold text-text-dim mb-1.5 uppercase tracking-wide">
                            {field.label}
                        </label>
                        <input
                            list={`list-${field.key}`}
                            value={selected[field.key] ?? ''}
                            onChange={e => onFieldChange(field.key, e.target.value)}
                            disabled={isBuffering}
                            placeholder={`Type to search...`}
                            className="w-full p-2.5 sm:p-3 bg-bg-muted border border-border-main rounded-xl text-sm focus:ring-2 focus:ring-brand-light focus:border-brand-light transition-all outline-none"
                        />
                        <datalist id={`list-${field.key}`}>
                            {field.options.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </datalist>
                    </div>
                ))}
            </div>

            {/* Sticky on mobile, inline on desktop */}
            <div className="fixed sm:relative bottom-0 left-0 right-0 sm:mt-4 p-4 sm:p-0 bg-bg-main sm:bg-transparent border-t border-border-muted sm:border-none z-20">
                <div className="flex flex-col gap-3">
                    {!isGameOver && (
                        <button
                            onClick={onGuess}
                            disabled={isBuffering}
                            className="w-full py-4 text-lg font-bold text-white bg-bg-inverse rounded-xl hover:opacity-90 disabled:bg-bg-soft transition-colors shadow-sm active:scale-95"
                        >
                            {isBuffering ? 'Loading Next...' : `Make Guess — ${remainingAttempts} left`}
                        </button>
                    )}
                    {extraActions}
                </div>
            </div>
        </>
    );
}
