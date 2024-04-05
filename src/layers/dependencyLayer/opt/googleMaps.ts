import axios from 'axios';
import { Client, TravelMode } from '@googlemaps/google-maps-services-js';
const client = new Client({});
const { GOOGLE_PLACES_API_KEY } = process.env;
console.log('axios: ', axios);
console.log('GOOGLE_PLACES_API_KEY: ', GOOGLE_PLACES_API_KEY);

export const getPlaceDetails = async (placeId: string) => {
  const response = await client.placeDetails({
    params: {
      place_id: placeId,
      key: GOOGLE_PLACES_API_KEY ?? '',
    },
    //timeout: 0
  });

  //const details = response.data.result;
  console.log('getPlaceDetails response: ', response);
  return response.data.result;
};

export interface GetDistanceProps {
  placeIdFrom: string;
  placeIdTo: string;
  departureTime: number;
}
export const getDistance = async ({
  placeIdFrom,
  placeIdTo,
  departureTime,
}: GetDistanceProps) => {
  //origins=place_id:ChIJ3S-JXmauEmsRUcIaWtf4MzE
  const response = await client.distancematrix({
    params: {
      key: GOOGLE_PLACES_API_KEY ?? '',
      origins: [`place_id:${placeIdFrom}`],
      destinations: [`place_id:${placeIdTo}`],
      departure_time: departureTime,
      mode: TravelMode.driving,
    },
    //timeout: 0
  });

  //const details = response.data.result;
  console.log('getDistance response: ', response);
  return response.data.rows[0].elements[0]; // distance, duration, status
};
