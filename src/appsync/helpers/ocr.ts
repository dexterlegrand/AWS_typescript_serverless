export const generate5DigitNumber = () => {
  const random = Math.random();
  return Math.floor(random * 90000) + 10000;
};

//export const generateEntityEmail = (name: string) => {
//  const subdomainFriendly = name.replace(/[^a-z0-9]/gi, '').toLowerCase();
//  const uniqueString = generate5DigitNumber();
//  return `${subdomainFriendly}_${uniqueString}@docs.admiin.com`;
//};

export const generateEntityEmail = (name: string) => {
  // Convert name to an array and use reduce to filter and accumulate only alphanumeric characters
  const subdomainFriendly = name.split('').reduce((acc, char) => {
    const isAlphanumeric =
      (char >= 'a' && char <= 'z') ||
      (char >= 'A' && char <= 'Z') ||
      (char >= '0' && char <= '9');
    return isAlphanumeric ? acc + char.toLowerCase() : acc;
  }, '');

  const uniqueString = generate5DigitNumber();
  return `${subdomainFriendly}_${uniqueString}@docs.admiin.com`;
};
