interface CoachMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `You are Forge, a friendly and concise strength & conditioning coach inside a mobile workout app.
- Give actionable workout programs and clear cues.
- Default rep ranges: hypertrophy 6-12, strength 3-6, endurance 12-20.
- When the user asks for a routine, structure it as: day name, exercise (sets x reps, rest).
- Be direct. No filler. Use short paragraphs and bullet points where helpful.
- If the user replies in Indonesian (bahasa gaul), reply in Indonesian too.`;

export async function askCoach(history: CoachMessage[]): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  const baseUrl = process.env.EXPO_PUBLIC_OPENAI_BASE_URL ?? 'https://api.openai.com/v1';
  const model = process.env.EXPO_PUBLIC_OPENAI_MODEL ?? 'gpt-4o-mini';

  if (!apiKey) {
    return scriptedFallback(history);
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Coach API error: ${response.status} ${text}`);
  }
  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Coach returned an empty response.');
  return content;
}

function scriptedFallback(history: CoachMessage[]): string {
  const last = history[history.length - 1]?.content.toLowerCase() ?? '';
  if (last.includes('push') || last.includes('pull') || last.includes('leg') || last.includes('ppl')) {
    return [
      'Push-Pull-Leg 3x/week — solid hypertrophy template:',
      '',
      'PUSH',
      '• Bench Press 4×6-8, rest 2-3 min',
      '• Incline DB Press 3×8-12, rest 90s',
      '• Cable Fly 3×12-15, rest 60s',
      '• Overhead Press 3×6-10, rest 2 min',
      '• Lateral Raise 4×12-15, rest 45s',
      '• Triceps Pushdown 3×10-15, rest 60s',
      '',
      'PULL',
      '• Pull-Up 4×AMRAP, rest 2 min',
      '• Barbell Row 4×6-8, rest 2 min',
      '• Lat Pulldown 3×10-12, rest 90s',
      '• Face Pull 3×15, rest 45s',
      '• Barbell Curl 3×8-10, rest 60s',
      '',
      'LEG',
      '• Back Squat 4×5, rest 3 min',
      '• Romanian Deadlift 3×8, rest 2 min',
      '• Bulgarian Split Squat 3×10/leg, rest 90s',
      '• Leg Curl 3×12, rest 60s',
      '• Standing Calf Raise 4×12-15, rest 60s',
      '',
      '(Tip: set up your OPENAI key in .env to chat with a live coach.)',
    ].join('\n');
  }
  if (last.includes('upper') || last.includes('lower')) {
    return [
      'Upper-Lower 4 days/week:',
      '',
      'UPPER A — Bench Press 4×5 · Barbell Row 4×6 · OHP 3×8 · Lat Pulldown 3×10 · DB Curl 3×10',
      'LOWER A — Back Squat 4×5 · RDL 3×8 · Walking Lunge 3×10/leg · Leg Curl 3×12 · Calf Raise 4×12',
      'UPPER B — Incline DB Press 4×8 · Pull-Up 4×AMRAP · Lateral Raise 4×12 · Cable Row 3×10 · Triceps Pushdown 3×12',
      'LOWER B — Deadlift 3×3 · Front Squat 3×6 · Bulgarian Split Squat 3×10/leg · Hip Thrust 3×8 · Hanging Leg Raise 3×12',
      '',
      'Run for 6-8 weeks, then increase loads or swap variations.',
    ].join('\n');
  }
  return [
    'Forge Coach (offline mode):',
    '',
    "Aku belum dikasih API key buat live chat — tapi gw kasih saran general dulu.",
    '',
    '• Buat hypertrophy: 8-15 reps, RPE 7-9, rest 60-120s.',
    '• Buat strength: 3-6 reps, RPE 7-8, rest 2-4 min.',
    '• Progress dengan kecil-kecil — tambah 1 rep atau 1-2kg per minggu.',
    '• Konsistensi > intensitas. 3x/minggu selama 6 bulan > 6x/minggu 2 minggu doang.',
    '',
    'Tambahin OpenAI key di .env (EXPO_PUBLIC_OPENAI_API_KEY) buat chat full.',
  ].join('\n');
}
