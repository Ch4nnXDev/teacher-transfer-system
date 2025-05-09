export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

export interface ErrorResponse extends BaseResponse<null> {
  error: string;
  statusCode: number;
}
