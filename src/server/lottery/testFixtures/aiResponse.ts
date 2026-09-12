export function aiResponse(output: unknown) {
  return new Response(
    JSON.stringify({
      id: "resp-test",
      created_at: 1,
      model: "gpt-5.4-nano-2026-03-17",
      status: "completed",
      output: [
        {
          type: "message",
          id: "msg-test",
          role: "assistant",
          status: "completed",
          content: [
            {
              type: "output_text",
              text: JSON.stringify(output),
              annotations: [],
            },
          ],
        },
      ],
      usage: {
        input_tokens: 10,
        output_tokens: 20,
        total_tokens: 30,
        input_tokens_details: { cached_tokens: 0 },
        output_tokens_details: { reasoning_tokens: 0 },
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}
