// apps/backend/src/appsync/resolvers/Query.contactsByEntity.ts
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

// apps/backend/src/appsync/resolvers/Query.contactsByEntity.ts
function request(ctx) {
  console.log("contactsByEntity ctx: ", ctx);
  const { entityId, filter, nextToken } = ctx.args;
  return dynamodbQueryRequest({
    key: "entityId",
    value: entityId,
    filter,
    index: "contactsByEntity",
    limit: 20,
    nextToken
  });
}
function response(ctx) {
  const { error, result } = ctx;
  console.log("result: ", result);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvUXVlcnkuY29udGFjdHNCeUVudGl0eS50cyIsICIuLi8uLi8uLi8uLi9hcHBzeW5jL2hlbHBlcnMvZHluYW1vZGIudHMiXSwKICAibWFwcGluZ3MiOiAiO0FBQUEsU0FBd0MsUUFBQUEsYUFBWTs7O0FDQXBEO0FBQUEsRUFXRTtBQUFBLE9BQ0s7QUFtRUEsSUFBTSx1QkFBdUIsQ0FBQztBQUFBLEVBQ25DO0FBQUEsRUFDQTtBQUFBLEVBQ0EsUUFBUSxJQUFJO0FBQUEsRUFDWjtBQUFBLEVBQ0EsUUFBUTtBQUFBLEVBQ1IsZ0JBQWdCO0FBQUEsRUFDaEIsWUFBWTtBQUNkLE1BQXVEO0FBQ3JELFFBQU0sU0FBUyxJQUNYLEtBQUssTUFBTSxLQUFLLFVBQVUsMkJBQTJCLENBQUMsQ0FBQyxJQUN2RDtBQUNKLFFBQU0sYUFBYTtBQUNuQixRQUFNLGtCQUFrQixFQUFFLFFBQVEsSUFBSTtBQUN0QyxRQUFNLG1CQUFtQixLQUFLLFNBQVMsWUFBWSxFQUFFLFFBQVEsTUFBTSxDQUFDO0FBRXBFLE1BQUksUUFBUTtBQUNWLFdBQU87QUFBQSxNQUNMLFdBQVc7QUFBQSxNQUNYLE9BQU8sRUFBRSxZQUFZLGlCQUFpQixpQkFBaUI7QUFBQSxNQUN2RDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0Esa0JBQWtCLGtCQUFrQjtBQUFBLE1BQ3BDLFFBQVE7QUFBQSxJQUNWO0FBQUEsRUFDRjtBQUVBLFNBQU87QUFBQSxJQUNMLFdBQVc7QUFBQSxJQUNYLE9BQU8sRUFBRSxZQUFZLGlCQUFpQixpQkFBaUI7QUFBQSxJQUN2RDtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQSxrQkFBa0Isa0JBQWtCO0FBQUEsSUFDcEMsUUFBUTtBQUFBLEVBQ1Y7QUFDRjs7O0FEbEhPLFNBQVMsUUFBUSxLQUFvQztBQUMxRCxVQUFRLElBQUksMEJBQTBCLEdBQUc7QUFDekMsUUFBTSxFQUFFLFVBQVUsUUFBUSxVQUFVLElBQUksSUFBSTtBQUU1QyxTQUFPLHFCQUFxQjtBQUFBLElBQzFCLEtBQUs7QUFBQSxJQUNMLE9BQU87QUFBQSxJQUNQO0FBQUEsSUFDQSxPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUDtBQUFBLEVBQ0YsQ0FBQztBQUNIO0FBRU8sU0FBUyxTQUFTLEtBQWM7QUFDckMsUUFBTSxFQUFFLE9BQU8sT0FBTyxJQUFJO0FBQzFCLFVBQVEsSUFBSSxZQUFZLE1BQU07QUFDOUIsTUFBSSxPQUFPO0FBQ1QsV0FBT0MsTUFBSyxZQUFZLE1BQU0sU0FBUyxNQUFNLE1BQU0sTUFBTTtBQUFBLEVBQzNEO0FBQ0EsUUFBTSxFQUFFLFFBQVEsQ0FBQyxHQUFHLFVBQVUsSUFBSTtBQUNsQyxTQUFPLEVBQUUsT0FBTyxVQUFVO0FBQzVCOyIsCiAgIm5hbWVzIjogWyJ1dGlsIiwgInV0aWwiXQp9Cg==
