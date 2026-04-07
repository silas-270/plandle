export type AttributeResult = 'correct' | 'incorrect' | 'partial';

/** A single selectable field in a game form */
export type FieldConfig = {
    key: string;
    label: string;
    options: string[];
};

/** Generic answer: any string→string mapping (e.g. { airline: 'Emirates' } or { manufacturer: 'Boeing', type: '737' }) */
export type GenericAnswer = Record<string, string>;

/** A single guess, works with any set of fields */
export type GenericGuess = {
    selection: GenericAnswer;
    results: Record<string, AttributeResult>;
};
