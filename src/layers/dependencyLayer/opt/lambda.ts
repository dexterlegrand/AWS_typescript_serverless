export const createResponse = (status: number, body: any) => {
  return {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    statusCode: status,
    body: JSON.stringify(body),
  };
};
