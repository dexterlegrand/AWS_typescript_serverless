// apps/backend/src/appsync/resolvers/Query.entityUsersByUser.ts
import {
  util as util2
} from "@aws-appsync/utils";

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
  const query = {
    operation: "Query",
    query: { expression, expressionNames, expressionValues },
    index: index || void 0,
    limit,
    nextToken,
    scanIndexForward: sortDirection === "ASC",
    select: "ALL_ATTRIBUTES"
  };
  if (filter) {
    query.filter = filter;
  }
  return query;
};

// apps/backend/src/appsync/resolvers/Query.entityUsersByUser.ts
function request(ctx) {
  console.log("Query.entityUsersByUser request ctx: ", ctx);
  const { sub } = ctx.identity;
  const { filter, nextToken } = ctx.args;
  return dynamodbQueryRequest({
    key: "userId",
    value: sub,
    filter,
    index: "entityUsersByUser",
    limit: 20,
    nextToken
  });
}
function response(ctx) {
  console.log("Query.entityUsersByUser response ctx: ", ctx);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvUXVlcnkuZW50aXR5VXNlcnNCeVVzZXIudHMiLCAiLi4vLi4vLi4vLi4vYXBwc3luYy9oZWxwZXJzL2R5bmFtb2RiLnRzIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBO0FBQUEsRUFJRSxRQUFBQTtBQUFBLE9BQ0s7OztBQ0xQO0FBQUEsRUFXRTtBQUFBLE9BQ0s7QUFtRUEsSUFBTSx1QkFBdUIsQ0FBQztBQUFBLEVBQ25DO0FBQUEsRUFDQTtBQUFBLEVBQ0EsUUFBUSxJQUFJO0FBQUEsRUFDWjtBQUFBLEVBQ0EsUUFBUTtBQUFBLEVBQ1IsZ0JBQWdCO0FBQUEsRUFDaEIsWUFBWTtBQUNkLE1BQXVEO0FBQ3JELFFBQU0sU0FBUyxJQUNYLEtBQUssTUFBTSxLQUFLLFVBQVUsMkJBQTJCLENBQUMsQ0FBQyxJQUN2RDtBQUNKLFFBQU0sYUFBYTtBQUNuQixRQUFNLGtCQUFrQixFQUFFLFFBQVEsSUFBSTtBQUN0QyxRQUFNLG1CQUFtQixLQUFLLFNBQVMsWUFBWSxFQUFFLFFBQVEsTUFBTSxDQUFDO0FBRXBFLFFBQU0sUUFBOEI7QUFBQSxJQUNsQyxXQUFXO0FBQUEsSUFDWCxPQUFPLEVBQUUsWUFBWSxpQkFBaUIsaUJBQWlCO0FBQUEsSUFDdkQsT0FBTyxTQUFTO0FBQUEsSUFDaEI7QUFBQSxJQUNBO0FBQUEsSUFDQSxrQkFBa0Isa0JBQWtCO0FBQUEsSUFDcEMsUUFBUTtBQUFBLEVBQ1Y7QUFFQSxNQUFJLFFBQVE7QUFDVixVQUFNLFNBQVM7QUFBQSxFQUNqQjtBQUVBLFNBQU87QUFDVDs7O0FEdEdPLFNBQVMsUUFBUSxLQUFvQztBQUMxRCxVQUFRLElBQUkseUNBQXlDLEdBQUc7QUFDeEQsUUFBTSxFQUFFLElBQUksSUFBSSxJQUFJO0FBQ3BCLFFBQU0sRUFBRSxRQUFRLFVBQVUsSUFBSSxJQUFJO0FBRWxDLFNBQU8scUJBQXFCO0FBQUEsSUFDMUIsS0FBSztBQUFBLElBQ0wsT0FBTztBQUFBLElBQ1A7QUFBQSxJQUNBLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQO0FBQUEsRUFDRixDQUFDO0FBQ0g7QUFFTyxTQUFTLFNBQVMsS0FBYztBQUNyQyxVQUFRLElBQUksMENBQTBDLEdBQUc7QUFDekQsUUFBTSxFQUFFLE9BQU8sT0FBTyxJQUFJO0FBQzFCLE1BQUksT0FBTztBQUNULFdBQU9DLE1BQUssWUFBWSxNQUFNLFNBQVMsTUFBTSxNQUFNLE1BQU07QUFBQSxFQUMzRDtBQUNBLFFBQU0sRUFBRSxRQUFRLENBQUMsR0FBRyxVQUFVLElBQUk7QUFDbEMsU0FBTyxFQUFFLE9BQU8sVUFBVTtBQUM1QjsiLAogICJuYW1lcyI6IFsidXRpbCIsICJ1dGlsIl0KfQo=
