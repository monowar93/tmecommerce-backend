import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { SupportService } from "./support.services";

//*----------------------------------------------------------send newsletter--------------------------------------
const newsletter = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  await SupportService.newsletter(email);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Newsletter subscription successful",
    data: null,
  });
});

export const SupportController = {
  newsletter,
};
