// controllers/paymentController.ts
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PaymentService } from "./payment.services";

const createPaymentIntent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const result = await PaymentService.createPaymentIntent(payload);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "OTP sent successfully",
      data: result,
    });
  },
);

// export const stripeWebhook = catchAsync(async (req: Request, res: Response) => {
//   const sig = req.headers["stripe-signature"]!;
//   const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

//   let event: Stripe.Event;

//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//   } catch (err: any) {
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Handle payment events
//   switch (event.type) {
//     case "payment_intent.succeeded":
//       const paymentIntent = event.data.object as Stripe.PaymentIntent;
//       console.log(`Payment succeeded for: ${paymentIntent.id}`);
//       // Update order status in DB
//       break;
//     case "payment_intent.payment_failed":
//       const failedPayment = event.data.object as Stripe.PaymentIntent;
//       console.error(
//         `Payment failed: ${failedPayment.last_payment_error?.message}`,
//       );
//       // Update order status in DB
//       break;
//     default:
//       console.log(`Unhandled event type: ${event.type}`);
//   }

//   res.status(200).json({ received: true });
// });

export const PaymentController = {
  createPaymentIntent,
};
