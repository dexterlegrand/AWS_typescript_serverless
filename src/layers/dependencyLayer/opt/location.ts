import {
  LocationClient,
  SearchPlaceIndexForTextCommand,
} from '@aws-sdk/client-location';

// Initialize Location Service client
const client = new LocationClient({ region: 'us-east-1' });

export const locationLookup = async (
  indexName: string,
  searchText: string,
  maxResults = 5
) => {
  try {
    const command = new SearchPlaceIndexForTextCommand({
      IndexName: indexName,
      Text: searchText,
      MaxResults: maxResults, // Optional: limit the number of results
    });

    const response = await client.send(command);
    return JSON.stringify(response);
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

const streetTypesAustralia: string[] = [
  'Avenue',
  'Boulevard',
  'Circuit',
  'Court',
  'Crescent',
  'Drive',
  'Highway',
  'Lane',
  'Place',
  'Road',
  'Street',
  'Terrace',
];

export const mapStreetType = (address: string): string | null => {
  const addressParts = address.split(' ');

  for (const part of addressParts) {
    if (streetTypesAustralia.includes(part)) {
      return part;
    }
  }

  return null;
};
