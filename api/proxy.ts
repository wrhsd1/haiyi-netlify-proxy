import fetch from "node-fetch";
import { VercelRequest, VercelResponse } from "@vercel/node";

const CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "*",
  "access-control-allow-headers": "*",
};

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    res.status(200).setHeader(CORS_HEADERS).end();
    return;
  }

  const reqData = JSON.parse(req.body);

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
    "Authorization": req.headers.authorization
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

  res.status(response.status).setHeader({
    ...CORS_HEADERS,
    "Content-Type": "application/json",
  }).send(formattedResponse);
}
