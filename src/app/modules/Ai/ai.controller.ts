import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AiMessengerServices } from "./ai.services";

const chat = catchAsync(async (req: Request, res: Response) => {
  const userMessage = req.body.message;

  const result = await AiMessengerServices.chat(userMessage);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Ai reply successfully",
    data: result,
  });
});

export const AiMessenger = {
  chat,
};
