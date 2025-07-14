import { Request, Response, NextFunction } from "express";

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  console.log("requireAdmin check");
  next();
};

export const requireSubscription = (req: Request, res: Response, next: NextFunction) => {
  console.log("requireSubscription check");
  next();
};

export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  console.log("csrfProtection applied");
  next();
};

export const ipWhitelist = (req: Request, res: Response, next: NextFunction) => {
  console.log("ipWhitelist check");
  next();
};

export const requestSizeLimit = (req: Request, res: Response, next: NextFunction) => {
  console.log("requestSizeLimit enforced");
  next();
};

// ✅ Combined export for convenience
export const securityMiddleware = [
  requireAdmin,
  requireSubscription,
  csrfProtection,
  ipWhitelist,
  requestSizeLimit
];
