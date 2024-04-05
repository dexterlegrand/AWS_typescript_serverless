// apps/backend/src/appsync/resolvers/Query.entityUsersByEntityId.ts
import { util as util2 } from "@aws-appsync/utils";

// apps/backend/src/appsync/helpers/dynamodb.ts
import {
  util
} from "@aws-appsync/utils";
var dynamodbQueryRequest = ({
  key,
  value,
  filter: f = void 0,
  index,
  limit = 20,
  sortDirection = "ASC",
  nextToken = void 0
}) => {
  const filter = f ? JSON.parse(util.transform.toDynamoDBFilterExpression(f)) : void 0;
  const expression = `#key = :key`;
  const expressionNames = { "#key": key };
  const expressionValues = util.dynamodb.toMapValues({ ":key": value });
  if (filter) {
    return {
      operation: "Query",
      query: { expression, expressionNames, expressionValues },
      index,
      filter,
      limit,
      nextToken,
      scanIndexForward: sortDirection === "ASC",
      select: "ALL_ATTRIBUTES"
    };
  }
  return {
    operation: "Query",
    query: { expression, expressionNames, expressionValues },
    index,
    limit,
    nextToken,
    scanIndexForward: sortDirection === "ASC",
    select: "ALL_ATTRIBUTES"
  };
};

// apps/backend/src/appsync/resolvers/Query.entityUsersByEntityId.ts
function request(ctx) {
  console.log("Query.entityUsersByEntity request ctx: ", ctx);
  const { entityId, filter, nextToken } = ctx.args;
  return dynamodbQueryRequest({
    key: "entityId",
    value: entityId,
    filter,
    index: "entityUsersByEntityId",
    limit: 20,
    nextToken
  });
}
function response(ctx) {
  console.log("Query.entityUsersByEntity response ctx: ", ctx);
  const { error, result } = ctx;
  if (error) {
    return util2.appendError(error.message, error.type, result);
  }
  const { items = [], nextToken } = result;
  return { items, nextToken };
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvUXVlcnkuZW50aXR5VXNlcnNCeUVudGl0eUlkLnRzIiwgIi4uLy4uLy4uLy4uL2FwcHN5bmMvaGVscGVycy9keW5hbW9kYi50cyJdLAogICJtYXBwaW5ncyI6ICI7QUFBQSxTQUF3QyxRQUFBQSxhQUFZOzs7QUNBcEQ7QUFBQSxFQVdFO0FBQUEsT0FDSztBQW1FQSxJQUFNLHVCQUF1QixDQUFDO0FBQUEsRUFDbkM7QUFBQSxFQUNBO0FBQUEsRUFDQSxRQUFRLElBQUk7QUFBQSxFQUNaO0FBQUEsRUFDQSxRQUFRO0FBQUEsRUFDUixnQkFBZ0I7QUFBQSxFQUNoQixZQUFZO0FBQ2QsTUFBdUQ7QUFDckQsUUFBTSxTQUFTLElBQ1gsS0FBSyxNQUFNLEtBQUssVUFBVSwyQkFBMkIsQ0FBQyxDQUFDLElBQ3ZEO0FBQ0osUUFBTSxhQUFhO0FBQ25CLFFBQU0sa0JBQWtCLEVBQUUsUUFBUSxJQUFJO0FBQ3RDLFFBQU0sbUJBQW1CLEtBQUssU0FBUyxZQUFZLEVBQUUsUUFBUSxNQUFNLENBQUM7QUFFcEUsTUFBSSxRQUFRO0FBQ1YsV0FBTztBQUFBLE1BQ0wsV0FBVztBQUFBLE1BQ1gsT0FBTyxFQUFFLFlBQVksaUJBQWlCLGlCQUFpQjtBQUFBLE1BQ3ZEO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQSxrQkFBa0Isa0JBQWtCO0FBQUEsTUFDcEMsUUFBUTtBQUFBLElBQ1Y7QUFBQSxFQUNGO0FBRUEsU0FBTztBQUFBLElBQ0wsV0FBVztBQUFBLElBQ1gsT0FBTyxFQUFFLFlBQVksaUJBQWlCLGlCQUFpQjtBQUFBLElBQ3ZEO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBLGtCQUFrQixrQkFBa0I7QUFBQSxJQUNwQyxRQUFRO0FBQUEsRUFDVjtBQUNGOzs7QURsSE8sU0FBUyxRQUFRLEtBQW9DO0FBQzFELFVBQVEsSUFBSSwyQ0FBMkMsR0FBRztBQUMxRCxRQUFNLEVBQUUsVUFBVSxRQUFRLFVBQVUsSUFBSSxJQUFJO0FBRTVDLFNBQU8scUJBQXFCO0FBQUEsSUFDMUIsS0FBSztBQUFBLElBQ0wsT0FBTztBQUFBLElBQ1A7QUFBQSxJQUNBLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQO0FBQUEsRUFDRixDQUFDO0FBQ0g7QUFFTyxTQUFTLFNBQVMsS0FBYztBQUNyQyxVQUFRLElBQUksNENBQTRDLEdBQUc7QUFDM0QsUUFBTSxFQUFFLE9BQU8sT0FBTyxJQUFJO0FBQzFCLE1BQUksT0FBTztBQUNULFdBQU9DLE1BQUssWUFBWSxNQUFNLFNBQVMsTUFBTSxNQUFNLE1BQU07QUFBQSxFQUMzRDtBQUNBLFFBQU0sRUFBRSxRQUFRLENBQUMsR0FBRyxVQUFVLElBQUk7QUFDbEMsU0FBTyxFQUFFLE9BQU8sVUFBVTtBQUM1QjsiLAogICJuYW1lcyI6IFsidXRpbCIsICJ1dGlsIl0KfQo=
