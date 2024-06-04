import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "@/server/db";

import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { env } from "@/env";

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authRouter = createTRPCRouter({
  signup: publicProcedure.input(SignupSchema).mutation(async ({ input }) => {
    try {
      const validateInput = SignupSchema.safeParse(input);

      if (!validateInput.success) {
        return {
          success: false,
          message: validateInput.error.errors,
        };
      }

      const { email, password, name } = validateInput.data;

      const userToCheck = await db.user.findFirst({
        where: {
          email,
        },
      });

      if (userToCheck) {
        return {
          success: false,
          message: "User already exists, please login with your credentials",
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await db.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });

      const payload = {
        userId: user.id,
        name: user.name,
        email: user.email,
      };

      const authToken = jwt.sign(payload, env.TOKEN_SECRET);

      return {
        success: true,
        message: `Welcome aboard, ${name}! Don't get too drunk 😉`,
        data: {
          ...payload,
          authToken,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "Unknown error occurred, please try again later",
      };
    }
  }),
  login: publicProcedure.input(LoginSchema).mutation(async ({ input }) => {
    try {
      const validateInput = LoginSchema.safeParse(input);

      if (!validateInput.success) {
        return {
          success: false,
          message: validateInput.error.errors,
        };
      }

      const { email, password } = validateInput.data;

      const userToCheck = await db.user.findFirst({
        where: {
          email,
        },
      });

      if (!userToCheck) {
        return {
          success: false,
          message: "User not found, please signup",
        };
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        userToCheck.password,
      );

      if (!isPasswordValid) {
        return {
          success: false,
          message: "Invalid password",
        };
      }

      const payload = {
        userId: userToCheck.id,
        name: userToCheck.name,
        email: userToCheck.email,
      };

      const authToken = jwt.sign(payload, env.TOKEN_SECRET);

      return {
        success: true,
        message: `Welcome back ${userToCheck.name}, don't get too drunk 😉`,
        data: {
          ...payload,
          authToken,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "Unknown error occurred, please try again later",
      };
    }
  }),
});
