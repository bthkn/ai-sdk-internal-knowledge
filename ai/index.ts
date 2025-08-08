import { openai } from "@ai-sdk/openai";
import { mistral } from '@ai-sdk/mistral';
import { wrapLanguageModel } from "ai";
import { ragMiddleware } from "./rag-middleware";

export const customModel = wrapLanguageModel({
  model: mistral("mistral-medium-2505"),
  middleware: ragMiddleware,
});
