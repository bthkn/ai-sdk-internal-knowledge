import { customModel } from "@/ai";
import { auth } from "@/app/(auth)/auth";
import { createMessage } from "@/app/db";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  convertToModelMessages,
  streamText,
} from "ai";
import { openai } from '@ai-sdk/openai';

export async function POST(request: Request) {
  const { id, messages, selectedFilePathnames } = await request.json();

  console.log(messages);

  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      // const statusId = generateId();
      writer.write({
        type: 'data-status',
        id: id,
        data: { status: 'call started' },
      });
      
      const completionId = generateId();

      const result = streamText({
        model: customModel,
        system: "you are a friendly assistant! keep your responses concise and helpful.",
        messages: messages,
        providerOptions: {
          files: {
            selection: selectedFilePathnames,
          },
        },
        onChunk({chunk}) {
          console.debug(`Chunk: ${chunk}`);
          writer.write({
            type: 'data-status',
            id: id,
            data: {
              status: 'streaming',
              timestamp: Date.now(),
            },
          });
        },
        onFinish() {
          writer.write({
            type: 'data-status',
            id: id,
            data: {
              status: 'completed',
            },
          });
        }
      });

      writer.merge(result.toUIMessageStream());
    },
  });

  return createUIMessageStreamResponse({ stream });

  // const result = streamText({
  //   model: customModel,
  //   system: "you are a friendly assistant! keep your responses concise and helpful.",
  //   messages: convertToModelMessages(messages),
  //   providerOptions: {
  //     files: {
  //       selection: selectedFilePathnames,
  //     },
  //   },
  //   onChunk: async ({ chunk }) => {
  //     console.log(chunk);
  //   },
  //   onFinish: async ({ text }) => {
  //     await createMessage({
  //       id,
  //       messages: [...convertToModelMessages(messages), { role: "assistant", text: text }],
  //       author: session.user?.email!,
  //     });
  //   },
  //   experimental_telemetry: {
  //     isEnabled: false,
  //     // functionId: "stream-text",
  //   },
  // });

  // return result.toUIMessageStreamResponse({});
}
