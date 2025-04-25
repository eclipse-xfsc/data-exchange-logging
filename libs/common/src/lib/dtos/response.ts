export type ErrorResponse = {
  statusCode: number;
  message: string;
  stack?: string;
};

export type ValidationErrorResponse = {
  statusCode: number;
  message: string[];
  error: string;
};
