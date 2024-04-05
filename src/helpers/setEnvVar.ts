export const setEnvVar = (variable?: string) => {
  if (!variable) {
    console.log('process.env: ', process.env);
    throw new Error('Environment variable is undefined');
  }

  return variable;
};
