import { mistral } from '@ai-sdk/mistral';
import { streamText, wrapLanguageModel } from "ai";

const customModel = wrapLanguageModel({
  model: mistral("mistral-medium-2505"),
  middleware: [],
});

const { textStream } = streamText({
  model: customModel,
  prompt: 'Invent a new holiday and describe its traditions.',
});

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
