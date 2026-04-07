import { AttributeResult } from '../types/quiz';

interface GridTileProps {
    text: string;
    status: AttributeResult;
}

export default function GridTile({ text, status }: GridTileProps) {
    // Green for correct, a neutral slate-gray for incorrect
    return (
        <div 
            className={`
                flex items-center justify-center px-2 rounded-lg border-b-2 font-bold text-[10px] sm:text-xs uppercase tracking-tight transition-all duration-300
                ${status === 'correct' 
                    ? 'bg-success-base border-success-dark text-white shadow-sm' 
                    : status === 'partial'
                    ? 'bg-warning-base border-warning-dark text-warning-dark shadow-sm'
                    : 'bg-bg-soft border-border-strong text-text-secondary'
                }
            `}
            title={text} // Shows full text on hover if truncated
        >
            <span className="truncate w-full text-center px-1">
                {text}
            </span>
        </div>
    );
}