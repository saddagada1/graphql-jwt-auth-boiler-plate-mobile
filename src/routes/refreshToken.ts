import { verify } from "jsonwebtoken";
import { Request, Response, Router } from "express";
import { User } from "../entity/User";
import { AuthPayload } from "../utils/types";
import { createAccessToken, createRefreshToken } from "../utils/auth";
import { ACCESS_TOKEN_EXPIRES_IN } from "../utils/constants";

interface RefreshTokenResponse {
  ok: boolean;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

const refreshRoute = Router();

refreshRoute.post(
  "/",
  async (req: Request, res: Response<RefreshTokenResponse | { error: string }>) => {
    try {
      const authorization = req.headers.authorization;
      if (!authorization) {
        throw "Bad Request";
      }
      const authRegex = /^Bearer/;
      if (!authRegex.test(authorization) || authorization.split(" ").length !== 2) {
        throw "Bad Request";
      }
      const base64Token = authorization.split(" ")[1];
      if (Buffer.from(base64Token, "base64").toString("base64") !== base64Token) {
        throw "Bad Request";
      }
      const token = Buffer.from(base64Token, "base64").toString("utf-8");
      const payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
      const authPayload = payload as AuthPayload;
      const user = await User.findOne({ where: { id: authPayload.user_id } });
      if (!user) {
        throw "Bad Request";
      }
      if (user.token_version !== authPayload.token_version) {
        throw "Bad Request";
      }
      return res.status(200).send({
        ok: true,
        access_token: createAccessToken(user),
        refresh_token: createRefreshToken(user),
        expires_in: ACCESS_TOKEN_EXPIRES_IN,
        user: user,
      });
    } catch (err) {
      console.error(err);
      return res.status(401).send({
        error: "Failed to Refresh Token",
      });
    }
  }
);

export default refreshRoute;
