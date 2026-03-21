import { AttributeResult } from '../types/quiz';

interface GridTileProps {
    text: string;
    status: AttributeResult;
}

export default function GridTile({ text, status }: GridTileProps) {
    // Green for correct, a neutral slate-gray for incorrect
    const isCorrect = status === 'correct';
    
    return (
        <div 
            className={`
                flex items-center justify-center px-2 rounded-lg border-b-2 font-bold text-[10px] sm:text-xs uppercase tracking-tight transition-all duration-300
                ${isCorrect 
                    ? 'bg-green-500 border-green-700 text-white shadow-sm' 
                    : 'bg-slate-200 border-slate-300 text-slate-600'
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