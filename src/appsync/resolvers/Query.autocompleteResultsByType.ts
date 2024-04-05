import { Context, DynamoDBQueryRequest, util } from '@aws-appsync/utils';
import { dynamodbQueryRequest } from '../helpers/dynamodb';

export function request(ctx: Context): DynamoDBQueryRequest {
  const { type, searchName, filter, nextToken } = ctx.args;
  console.log('searchName: ', searchName);

  if (searchName?.length > 0) {
    const query: DynamoDBQueryRequest = {
      operation: 'Query',
      query: {
        expression: '#type = :type and begins_with(#searchName, :searchName)',
        expressionNames: {
          '#type': 'type',
          '#searchName': 'searchName',
        },
        expressionValues: util.dynamodb.toMapValues({
          ':type': type,
          ':searchName': searchName,
        }),
      },
      index: 'autocompleteResultsByType',
      limit: 6,
      nextToken,
      select: 'ALL_ATTRIBUTES',
      scanIndexForward: true,
    };

    if (filter) {
      query.filter = JSON.parse(
        util.transform.toDynamoDBFilterExpression(filter)
      );
    }

    console.log('query: ', query);

    return query;
  } else {
    return dynamodbQueryRequest({
      key: 'type',
      value: type,
      filter,
      index: 'autocompleteResultsByType',
      limit: 20,
      nextToken,
    });
  }
}

export function response(ctx: Context) {
  const { error, result } = ctx;
  console.log('result: ', result);
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  const { items = [], nextToken } = result;
  return { items, nextToken };
}
