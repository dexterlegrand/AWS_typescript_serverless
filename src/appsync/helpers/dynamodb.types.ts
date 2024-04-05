import { DynamoDBFilterObject, Key } from '@aws-appsync/utils';

export type DynamodbDeleteRequestProps = {
  key: Key;
  condition?: DynamoDBFilterObject;
  returnValues?: string;
};

export type dynamodbPutRequestProps = {
  key: Key;
  data: Key;
  condition?: DynamoDBFilterObject;
};

export type dynamodbQueryRequestProps = {
  key: string;
  value: string;
  filter?: Key;
  index?: string;
  limit?: number;
  sortDirection?: string;
  nextToken?: string;
};

export type dynamoDBScanRequestProps = {
  filter?: Key;
  limit?: number;
  nextToken?: string;
};

export type DynamodbUpdateRequestProps = {
  key: Key;
  data: Key;
  condition?: DynamoDBFilterObject;
};
