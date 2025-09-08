import { envVars } from "../../config/env";
import AppError from "../../error/AppError";
import { sendEmail } from "../../utils/sendEmail";

//*----------------------------------------------------newsletter--------------------------------------------

const newsletter = async (email: string) => {
  if (!email) {
    throw new AppError(404, "Provide valid email");
  }

  try {
    await Promise.all([
      sendEmail({
        to: email,
        subject: "Newsletter Subscription",
        templateName: "newsletter",
        templateData: { name: "Subscriber", email },
      }),

      sendEmail({
        to: envVars.EMAIL_SENDER.SMTP_FROM,
        subject: "New Newsletter Subscription",
        templateName: "adminNewsletter",
        templateData: { email },
      }),
    ]);
  } catch (err) {
    console.error("Failed to send newsletter emails:", err);
    throw new AppError(500, "Failed to send newsletter emails");
  }
};

export const SupportService = {
  newsletter,
};
