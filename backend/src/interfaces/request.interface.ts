import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    userId: number;
    email: string;
    role: string;
  };
}

export interface FilterRequest extends Request {
  method: string;
  url: string;
}
