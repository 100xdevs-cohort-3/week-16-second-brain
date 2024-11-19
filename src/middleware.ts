import { Request, Response, NextFunction, request, RequestHandler } from "express";
import jwt, { Secret } from "jsonwebtoken";

interface jwtPayload{
  id:string;
}

export const userMiddleware:RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
   try {
     const header = req.header("Authorization");
     const token = header?.split(" ")[1]
    
     const decoded = jwt.verify(token as string,process.env.JWT_SECRET as Secret ) as jwtPayload
     if(!decoded){
         res.status(401).json({
             message:"Unauthorized Access"
         })
         return;
     }

    req.userId =decoded.id;
    next();
   } catch (error) {
    res.status(401).json({
        message:"Invalid access token"
    })
    return;
   }

};