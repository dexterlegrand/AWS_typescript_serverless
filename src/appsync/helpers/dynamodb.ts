import {
  //ConditionCheckExpression,
  DynamoDBDeleteItemRequest,
  DynamoDBGetItemRequest,
  DynamoDBPutItemRequest,
  DynamoDBQueryRequest,
  DynamoDBScanRequest,
  DynamoDBUpdateItemRequest,
  ExpressionAttributeNameMap,
  ExpressionAttributeValueMap,
  Key,
  ConditionCheckExpression,
  util,
} from '@aws-appsync/utils';
import {
  DynamodbDeleteRequestProps,
  dynamodbPutRequestProps,
  dynamodbQueryRequestProps,
  dynamoDBScanRequestProps,
  DynamodbUpdateRequestProps,
} from './dynamodb.types';

export const dynamodbDeleteRequest = ({
  key,
  condition: inCondObj,
}: DynamodbDeleteRequestProps): DynamoDBDeleteItemRequest => {
  let condition: Partial<ConditionCheckExpression> = {};
  if (inCondObj) {
    condition = JSON.parse(
      util.transform.toDynamoDBConditionExpression(inCondObj)
    );
    //if (
    //  condition && condition.expressionValues &&
    //  !Object.keys(condition.expressionValues).length
    //) {
    //  delete condition.expressionValues;
    //}
  }
  console.log('inCondObjinCondObjinCondObj: ', inCondObj);
  console.log('conditionconditioncondition: ', condition);

  return {
    operation: 'DeleteItem',
    key: util.dynamodb.toMapValues(key),
    condition: condition as ConditionCheckExpression,
  };
};

export const dynamoDBGetItemRequest = (key: Key): DynamoDBGetItemRequest => {
  return {
    operation: 'GetItem',
    key: util.dynamodb.toMapValues(key),
  };
};

export const dynamodbPutRequest = ({
  key,
  data,
  condition: inCondObj = {},
}: dynamodbPutRequestProps): DynamoDBPutItemRequest => {
  const condition = JSON.parse(
    util.transform.toDynamoDBConditionExpression(inCondObj)
  );
  if (
    condition.expressionValues &&
    !Object.keys(condition.expressionValues).length
  ) {
    delete condition.expressionValues;
  }
  return {
    operation: 'PutItem',
    key: util.dynamodb.toMapValues(key),
    attributeValues: util.dynamodb.toMapValues(data),
    condition,
  };
};

export const dynamodbQueryRequest = ({
  key,
  value,
  filter: f = undefined,
  index,
  limit = 20,
  sortDirection = 'ASC',
  nextToken = undefined,
}: dynamodbQueryRequestProps): DynamoDBQueryRequest => {
  const filter = f
    ? JSON.parse(util.transform.toDynamoDBFilterExpression(f))
    : undefined;
  const expression = `#key = :key`;
  const expressionNames = { '#key': key };
  const expressionValues = util.dynamodb.toMapValues({ ':key': value });

  const query: DynamoDBQueryRequest = {
    operation: 'Query',
    query: { expression, expressionNames, expressionValues },
    index: index || undefined,
    limit,
    nextToken,
    scanIndexForward: sortDirection === 'ASC',
    select: 'ALL_ATTRIBUTES',
  };

  if (filter) {
    query.filter = filter;
  }

  return query;
};

export const dynamoDBScanRequest = ({
  filter: f,
  limit,
  nextToken,
}: dynamoDBScanRequestProps): DynamoDBScanRequest => {
  const filter = f
    ? JSON.parse(util.transform.toDynamoDBFilterExpression(f))
    : undefined;

  return { operation: 'Scan', filter, limit, nextToken };
};

export const dynamodbUpdateRequest = ({
  key,
  data,
  condition: inCondObj, //NOTE: condition appears to not be optional, throws a ts lint error
}: DynamodbUpdateRequestProps): DynamoDBUpdateItemRequest => {
  const sets = [];
  const removes = [];
  const expressionNames: ExpressionAttributeNameMap = {};
  const expValues: ExpressionAttributeValueMap = {};

  for (const [k, v] of Object.entries(data)) {
    expressionNames[`#${k}`] = k;
    if (v) {
      sets.push(`#${k} = :${k}`);
      expValues[`:${k}`] = v;
    } else {
      removes.push(`#${k}`);
    }
  }

  let expression = sets.length ? `SET ${sets.join(', ')}` : '';
  expression += removes.length ? ` REMOVE ${removes.join(', ')}` : '';

  const condition = inCondObj
    ? JSON.parse(util.transform.toDynamoDBConditionExpression(inCondObj))
    : {};
  if (
    condition.expressionValues &&
    !Object.keys(condition.expressionValues).length
  ) {
    delete condition.expressionValues;
  }

  return {
    operation: 'UpdateItem',
    key: util.dynamodb.toMapValues(key),
    condition,
    update: {
      expression,
      expressionNames,
      expressionValues: util.dynamodb.toMapValues(expValues),
    },
  };
};
