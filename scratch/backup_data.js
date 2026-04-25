/* 
   CORRECTED PLANDLE BACKUP DATA (Snapshot: 2026-04-25)
   Matches current schema in useStats.ts (recentResults instead of guessDistribution)
*/

// [1] Miles Balance (plandle_miles_v1)
const miles = 135775;

// [2] Career Stats (plandle_stats_v2) - JSON String:
const stats = {"daily":{"played":9,"wins":9,"currentStreak":9,"maxStreak":9,"recentResults":[true,true,true,true,true,true,true,true,true]},"practice":{"played":427,"wins":427,"currentStreak":100,"maxStreak":100,"recentResults":[true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true]},"trivia":{"played":13,"wins":8,"currentStreak":1,"maxStreak":4,"recentResults":[true,false,false,true,true,true,true,false,false,true,true,true,true]}};

// [3] Daily Log (plandle_daily_log) - JSON String:
const dailyLog = {"2026-04-24":{"hasPlayed":true,"hasWon":true,"guesses":["???"],"mode":"daily"},"2026-04-23":{"hasPlayed":true,"hasWon":true,"guesses":["???"],"mode":"daily"},"2026-04-22":{"hasPlayed":true,"hasWon":true,"guesses":["???"],"mode":"daily"},"2026-04-21":{"hasPlayed":true,"hasWon":true,"guesses":["???"],"mode":"daily"},"2026-04-20":{"hasPlayed":true,"hasWon":true,"guesses":["???"],"mode":"daily"},"2026-04-19":{"hasPlayed":true,"hasWon":true,"guesses":["???"],"mode":"daily"},"2026-04-18":{"hasPlayed":true,"hasWon":true,"guesses":["???"],"mode":"daily"},"2026-04-17":{"hasPlayed":true,"hasWon":true,"guesses":["???"],"mode":"daily"},"2026-04-16":{"hasPlayed":true,"hasWon":true,"guesses":["???"],"mode":"daily"}};

// [4] User Profile (plandle_user_v1) - JSON String:
const userProfile = {"id":"7662c19a-9ea0-42cf-90b5-c72635926ec0","name":"Eagle One"};
