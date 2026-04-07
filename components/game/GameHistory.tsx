import { FieldConfig, GenericGuess } from '@/types/genericGame';
import GridTile from '../GridTile';

type Props = {
    guesses: GenericGuess[];
    fields: FieldConfig[];
};

const GRID_COLS: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
};

export default function GameHistory({ guesses, fields }: Props) {
    if (guesses.length === 0) return null;
    
    const colClass = GRID_COLS[fields.length] ?? 'grid-cols-3';

    return (
        <div className="space-y-2 border-t pt-4 border-border-muted">
            {guesses.map((guess, index) => (
                <div key={index} className={`grid ${colClass} gap-2 h-10 animate-in fade-in slide-in-from-top-2 duration-300`}>
                    {fields.map(field => (
                        <GridTile 
                            key={field.key}
                            text={guess.selection[field.key] ?? ''} 
                            status={guess.results[field.key] ?? 'incorrect'} 
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
