const OPENAI_API_BASE = process.env.OPENAI_API_BASE ?? 'https://api.openai.com/v1';

export const getOpenAIKey = () => process.env.OPENAI_API_KEY;

export const getOpenAIModel = () => process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

export const createOpenAIResponse = async (payload: Record<string, unknown>) => {
  const apiKey = getOpenAIKey();
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }

  const response = await fetch(`${OPENAI_API_BASE}/responses`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${detail}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
};
