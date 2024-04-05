import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { generate5DigitNumber } from '../../../appsync/helpers/ocr';
const DdbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DdbClient);

const { TABLE_ENTITYUSER } = process.env;
export const validateIsEntityUser = async ({
  entityId,
  userId,
}: {
  entityId: string;
  userId: string;
}) => {
  const params = {
    TableName: TABLE_ENTITYUSER ?? '',
    IndexName: 'entityUsersByEntity',
    Key: {
      entityId,
      userId,
    },
  };

  const command = new GetCommand(params);
  const userData = await docClient.send(command);

  if (!userData.Item) {
    throw new Error('Not authorised to upload for entity');
  }

  return userData.Item ?? null;
};

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
