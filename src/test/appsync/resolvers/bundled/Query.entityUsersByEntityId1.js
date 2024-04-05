// apps/backend/src/appsync/resolvers/Query.entityUsersByEntityId1.ts
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

// apps/backend/src/appsync/resolvers/Query.entityUsersByEntityId1.ts
function request(ctx) {
  console.log("Query.entityUsersByEntity request ctx: ", ctx);
  const { entityId, filter, nextToken } = ctx.args;
  return dynamodbQueryRequest({
    key: "entityId",
    value: entityId,
    filter,
    index: "entityUsersByEntity",
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvUXVlcnkuZW50aXR5VXNlcnNCeUVudGl0eUlkMS50cyIsICIuLi8uLi8uLi8uLi9hcHBzeW5jL2hlbHBlcnMvZHluYW1vZGIudHMiXSwKICAibWFwcGluZ3MiOiAiO0FBQUEsU0FBd0MsUUFBQUEsYUFBWTs7O0FDQXBEO0FBQUEsRUFXRTtBQUFBLE9BQ0s7QUFtRUEsSUFBTSx1QkFBdUIsQ0FBQztBQUFBLEVBQ25DO0FBQUEsRUFDQTtBQUFBLEVBQ0EsUUFBUSxJQUFJO0FBQUEsRUFDWjtBQUFBLEVBQ0EsUUFBUTtBQUFBLEVBQ1IsZ0JBQWdCO0FBQUEsRUFDaEIsWUFBWTtBQUNkLE1BQXVEO0FBQ3JELFFBQU0sU0FBUyxJQUNYLEtBQUssTUFBTSxLQUFLLFVBQVUsMkJBQTJCLENBQUMsQ0FBQyxJQUN2RDtBQUNKLFFBQU0sYUFBYTtBQUNuQixRQUFNLGtCQUFrQixFQUFFLFFBQVEsSUFBSTtBQUN0QyxRQUFNLG1CQUFtQixLQUFLLFNBQVMsWUFBWSxFQUFFLFFBQVEsTUFBTSxDQUFDO0FBRXBFLFFBQU0sUUFBOEI7QUFBQSxJQUNsQyxXQUFXO0FBQUEsSUFDWCxPQUFPLEVBQUUsWUFBWSxpQkFBaUIsaUJBQWlCO0FBQUEsSUFDdkQsT0FBTyxTQUFTO0FBQUEsSUFDaEI7QUFBQSxJQUNBO0FBQUEsSUFDQSxrQkFBa0Isa0JBQWtCO0FBQUEsSUFDcEMsUUFBUTtBQUFBLEVBQ1Y7QUFFQSxNQUFJLFFBQVE7QUFDVixVQUFNLFNBQVM7QUFBQSxFQUNqQjtBQUVBLFNBQU87QUFDVDs7O0FEM0dPLFNBQVMsUUFBUSxLQUFvQztBQUMxRCxVQUFRLElBQUksMkNBQTJDLEdBQUc7QUFDMUQsUUFBTSxFQUFFLFVBQVUsUUFBUSxVQUFVLElBQUksSUFBSTtBQUU1QyxTQUFPLHFCQUFxQjtBQUFBLElBQzFCLEtBQUs7QUFBQSxJQUNMLE9BQU87QUFBQSxJQUNQO0FBQUEsSUFDQSxPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUDtBQUFBLEVBQ0YsQ0FBQztBQUNIO0FBRU8sU0FBUyxTQUFTLEtBQWM7QUFDckMsVUFBUSxJQUFJLDRDQUE0QyxHQUFHO0FBQzNELFFBQU0sRUFBRSxPQUFPLE9BQU8sSUFBSTtBQUMxQixNQUFJLE9BQU87QUFDVCxXQUFPQyxNQUFLLFlBQVksTUFBTSxTQUFTLE1BQU0sTUFBTSxNQUFNO0FBQUEsRUFDM0Q7QUFDQSxRQUFNLEVBQUUsUUFBUSxDQUFDLEdBQUcsVUFBVSxJQUFJO0FBQ2xDLFNBQU8sRUFBRSxPQUFPLFVBQVU7QUFDNUI7IiwKICAibmFtZXMiOiBbInV0aWwiLCAidXRpbCJdCn0K
