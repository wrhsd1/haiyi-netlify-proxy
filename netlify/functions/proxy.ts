import { Context } from "@netlify/functions";
import fetch from "node-fetch";

const CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "*",
  "access-control-allow-headers": "*",
};

export async function handler(event: any, context: Context) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: ""
    };
  }

  const reqData = JSON.parse(event.body);

  const messages = reqData.messages.map((msg: any) => ({
    content: msg.content,
    role: msg.role,
  }));

  const newReqData = {
    model_name: reqData.model,
    messages: messages,
  };

  const newHeaders = {
    "Content-Type": "application/json",
    "Token": event.headers.authorization.split(" ")[1]
  };

  const response = await fetch("https://www.seaart.ai/api/v1/chat-completion/completion", {
    method: "POST",
    body: JSON.stringify(newReqData),
    headers: newHeaders,
  });

  const responseText = await response.text();

  const formattedResponse = {
    choices: [
      {
        message: {
          role: "assistant",
          content: responseText,
        },
        index: 0,
        finish_reason: "stop",
      },
    ],
  };

  return {
    statusCode: response.status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formattedResponse),
  };
}
