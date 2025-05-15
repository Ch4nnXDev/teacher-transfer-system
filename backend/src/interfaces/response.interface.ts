// Base response interface
export interface BaseResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

// Error response interface
export interface ErrorResponse extends BaseResponse<null> {
  error: string;
  statusCode: number;
}
