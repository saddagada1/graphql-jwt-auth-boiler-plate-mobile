import { Request, Response } from "express";
import { Redis } from "ioredis";
import { User } from "../entity/User";

export type MyContext = {
  req: Request;
  res: Response;
  redis: Redis;
  user_payload?: { user: User };
  google_payload?: { google_email?: string };
};

export type AuthPayload = {
  user_id: number;
  token_version: number;
};
