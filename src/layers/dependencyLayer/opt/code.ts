export const generate5DigitNumber = () => {
  const random = Math.random();
  return Math.floor(random * 90000) + 10000;
};
