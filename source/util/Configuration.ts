export interface Configuration {
  api_key: string;
  max_tokens: number;
  temperature: number;
  model: string;
  prompt: string;
}

export const defaultConfig: Configuration = {
  api_key: "",
  max_tokens: 128,
  temperature: 1,
  model: "text-davinci-003",
  prompt:
    "${text}\n\nSummary in 5 bullet points in the language that the text is written in.",
};
