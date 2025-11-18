import express from "express";
import { AiMessenger } from "./ai.controller";

const router = express.Router();

router.post("/chat", AiMessenger.chat);

export const AiRoutes = router;
