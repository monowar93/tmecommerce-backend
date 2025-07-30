import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { createUserZodSchema, updateUserZodSchema } from "./user.validations";
import { UserControllers } from "./user.controller";
import { Role } from "./user.interface";
import { checkAuth } from "../../middleware/checkAuth";

const router = Router();

//Route api/v1/user/register
router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserControllers.createUser,
);

//Route api/v1/user/all-users
router.get(
  "/all-users",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserControllers.getAllUsers,
);

//Route api/v1/user/me
router.get("/me", UserControllers.getMe);

//Route api/v1/user/:id
router.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserControllers.getSingleUser,
);

//Route api/v1/user/:id
router.patch(
  "/:id",
  validateRequest(updateUserZodSchema),
  checkAuth(...Object.values(Role)),
  UserControllers.updateUser,
);

export const UserRoutes = router;
