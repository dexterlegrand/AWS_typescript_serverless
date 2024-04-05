import { APIGatewayProxyResult } from 'aws-lambda';

export const generateResponse = (
  statusCode: number,
  body: any,
  headers?: {
    [header: string]: boolean | number | string;
  }
): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: headers || { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(body),
  };
};
