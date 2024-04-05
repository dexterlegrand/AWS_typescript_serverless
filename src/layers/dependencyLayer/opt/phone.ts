import { CountryCode, parsePhoneNumber } from 'libphonenumber-js';

export const getPhoneNumber = (
  text: string,
  defaultCountry?: CountryCode
): string | null | undefined => {
  let phoneNumber: string | null | undefined;
  if (text) {
    try {
      const parsedPhone = parsePhoneNumber(text, defaultCountry ?? undefined);
      console.log(
        `parsePhoneNumber: text: ${text} defaultCountry: ${defaultCountry}: `,
        parsedPhone
      );
      phoneNumber =
        parsedPhone?.number && parsedPhone?.isValid()
          ? parsedPhone.number
          : null;
    } catch (err: any) {
      console.log('ERROR parsePhoneNumber: ', err);
    }

    if (!phoneNumber) {
      try {
        const parsedPhone = parsePhoneNumber(text, 'AU');
        console.log(
          `parsePhoneNumber: text: ${text} defaultCountry: AU: `,
          parsedPhone
        );
        phoneNumber =
          parsedPhone?.number && parsedPhone?.isValid()
            ? parsedPhone.number
            : null;
      } catch (err: any) {
        console.log('ERROR parsePhoneNumber: ', err);
      }
    }
  }

  console.log('text: ', text);
  console.log('phoneNumber: ', phoneNumber);

  return phoneNumber;
};
