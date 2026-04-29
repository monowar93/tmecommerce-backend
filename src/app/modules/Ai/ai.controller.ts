import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AiMessengerServices } from "./ai.services";

const chat = catchAsync(async (req: Request, res: Response) => {
  const userMessage = req.body.message;

  const result = await AiMessengerServices.chat(userMessage);

  if (!result) {
    throw new Error("Failed to get response, Internal Ai error");
  }
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");

  try {
    for await (const chunk of result.textStream) {
      if (res.writableEnded) break;
      res.write(chunk);
    }
  } catch (err) {
    console.error(err);
    res.write("\n[Stream failed, please retry]\n");
  } finally {
    res.end();
  }
});

export const AiMessenger = {
  chat,
};
