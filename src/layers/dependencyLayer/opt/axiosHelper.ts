import axios, { AxiosError } from 'axios';
export const handleAxiosError = (err: Error | AxiosError) => {
  if (axios.isAxiosError(err)) {
    return err?.response?.data?.message;
  } else {
    return JSON.stringify(err);
  }
};
