import { GoogleGenerativeAI } from "@google/generative-ai";
import { envVars } from "../../config/env";

type GenResult = string;

const apiKey = envVars.OPENAI_API_KEY;
if (!apiKey) {
  console.warn(
    "GEMINI_API_KEY is not set. Gemini calls will fail until you add it to .env",
  );
}

const genAI = new GoogleGenerativeAI(apiKey || "");

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite", //"gemini-2.5-flash", // or another valid model
});

const websiteContext = `
Website Name: TM-ECommerce

Website URL: https://tm-ecommerce.vercel.app

Creator: Tarek Monowar, from Sylhet, Bangladesh. Full-Stack Web Developer , he is experienced in building web applications using technologies like MERN Stack, Next.js, React, Node.js, Express, and MongoDB, postgreSQL , Prisma , GraphQL, Docker, Tailwind css, shad cn/ui , and animation library ,and always build by TypeScript. He build 3/4 industry Standers website that have all features for example E-commerce website, Ride booking Application, hsopitam managment apps etc.his linkedIn Profile Link is https://www.linkedin.com/in/tarekmonowar and portfolio website link is https://tarekmonowar.vercel.app and email tarekmonowar353@gmail.com.He Completed bachelor of science from Sylhet MC College and currently pursuing masters in mathmatics.

Project Description: This is e-commerce project showcasing full-stack development skills.it is industry staderd project all features have . It features product listing, product details,Products filtering, Product Seraching add to cart and wishlist and checkout by strip and after successfull payment user get invoice order details realtime tracking update get email etc. user can login/register by their email and passsword ,facebook,github account,google login . and session handle by JWT token in cookies session.or for visitig it has user/admin demo account anyone can login and explore by demo account that have in login page. it has Admin dahsboard where all statistic update realtime when new user create/product add/update/delete or orders add/delete/tracking upodate and real time revenue. and get notification when order place in admin dashboard top right corner notification ball. admin can block user make order update actually all indutry standerd ecomerce that have all have this ecommerce project have .it has strong security system password hashing by bcrypt js , data validation by zod , sanitize etc. uses redis and cloudinary for fast perfomance. overall it is full fledge industry standerd ecommerce project.

Type: ECommerce platform

Features:
- Product listing
- Product details page
- Add to cart demo
- Checkout 
- Responsive UI
- Admin Dashboard
- User Authentication (Email/Password, Google, Facebook, GitHub)
- JWT-based session management
- Real-time order tracking
- Email notifications
- Payment integration with Stripe
- Product search and filtering
- User roles (Admin, User)
- Order history and invoices
- Demo accounts for easy exploration
- And more industry standard e-commerce features.


Login / Sign In Button:
Located at the top-right corner inside the Account dropdown. When logged in, it shows: Admin Dashboard, My Orders, Order Tracking, Wishlist, My Account, and Sign Out.

Account Menu:
Placed in the header bar at the far right, labeled "Account" with an icon. Clicking opens user profile and account options.

Cart Button:
Located in the top navigation bar near Account. Displays a small number badge showing total cart items.


All Categories Dropdown:
Located to the left of the search bar. Clicking “All Categories” opens a dropdown (Fashion, Groceries, Beauty, Footwear, Electronics, Jewellery, Gifts).

Navbar Links:
All Products, My Accounts, Order Tracking, Contact, Wishlist, Cart, Account.

My Account Page:
Accessible from the Account dropdown. Displays:
- Profile image user can change profile image by clicking on it
- Full name
- Left sidebar with: Change Password, Shipping Address, My Orders, Delete Account
- Right section with editable fields: Name, Phone, Email, DOB
- In left top corner user can verify their email with a button if not verified. by email OTP verification system.user must verify their email before placing order.

Product Filters (All Products Page):
Left sidebar allows filtering by:
- Category
- Price range slider
- Rating (1–5 stars)

Add to Cart Button:
Visible on every product card under the product price.




Tech stack: Next.js (React),TypeScript,tailwind css, shadcn/ui, Node/Express backend, MongoDB (or your DB), Redis,  Cloudinary , JWt, bcrypt.

Purpose: Project showcase for full-stack development skills.

Rules:
1. Always answer website-specific questions using ONLY the info above.
2. if some one asked who ceated you? or who is your creator? or who is developer of this website? or who build this website? or who build you? or who is owner of this website? or who developed this website? or who designed this website? or who is the author of this website? or similar question please answer like this : Tarek Monowar from Sylhet, Bangladesh is the developer of this website
3. Be concise (1-3 sentences) unless more details are requested.
4. If the user asks something unrelated to the website (general knowledge, greetings, small talk, or AI capabilities), answer naturally and politely as an AI assistant.
`;

const buildPrompt = (userMessage: string) => {
  return [
    "You are the AI assistant for an e-commerce project showcase website.",
    "Prioritize website-specific answers using the information provided.",
    "",
    "=== WEBSITE INFO ===",
    websiteContext,
    "=== END WEBSITE INFO ===",
    "",
    `User question: ${userMessage}`,
    "",
    "Reply as the website assistant. Follow the rules above for general or unrelated questions.",
  ].join("\n");
};

const extractTextFromModelResult = (result: any): string => {
  // SDKs differ between versions. Try common fields as fallback.
  try {
    // Preferred earlier example: result.response.text()
    if (result?.response?.text && typeof result.response.text === "function") {
      return result.response.text();
    }
    // Sometimes the text is nested in output[0].content[0].text
    if (Array.isArray(result?.output) && result.output.length) {
      const first = result.output[0];
      if (
        Array.isArray(first?.content) &&
        first.content.length &&
        typeof first.content[0]?.text === "string"
      ) {
        return first.content[0].text;
      }
    }
    // Another possible shape:
    if (typeof result?.output_text === "string") {
      return result.output_text;
    }
    // Last resort: stringify
    return String(result);
  } catch (err) {
    return String(result);
  }
};

// const chat = async (message: string): Promise<GenResult> => {
//   if (!message) return "Please provide a message.";

//   const prompt = buildPrompt(message);

//   try {
//     // ❗ FIXED generateContent usage
//     const result = await model.generateContent(prompt);

//     const reply = extractTextFromModelResult(result);
//     return reply?.trim() ?? "No reply from model.";
//   } catch (err: any) {
//     console.error("Error calling Gemini:", err?.message ?? err);
//     return "Sorry — I couldn't get a response from the AI right now.";
//   }
// };
const chat = async (message: string, retries = 3): Promise<GenResult> => {
  if (!message) return "Please provide a message.";

  // Dynamically shorten context for faster processing
  const prompt = buildPrompt(message);

  for (let i = 0; i < retries; i++) {
    try {
      // ❗ First attempt immediate
      const result = await model.generateContent(prompt);
      const reply = extractTextFromModelResult(result);
      return reply?.trim() ?? "No reply from model.";
    } catch (err: any) {
      console.error(`Attempt ${i + 1} failed:`, err?.message ?? err);

      // Retry only if not last attempt
      if (i < retries - 1) {
        // Slightly increase delay for each retry
        await new Promise((res) => setTimeout(res, 1000 * (i + 1)));
      }
    }
  }

  return "Sorry — I couldn't get a response from the AI right now. Please try again.";
};

export const AiMessengerServices = {
  chat,
};
