import { TokenPayload } from "./AutenticacionTypes.js";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
