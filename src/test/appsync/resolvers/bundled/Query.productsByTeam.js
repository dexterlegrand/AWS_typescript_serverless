// apps/backend/src/appsync/helpers/dynamodb.ts
import {
  util as util2
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
  const filter = f ? JSON.parse(util2.transform.toDynamoDBFilterExpression(f)) : void 0;
  const expression = `#key = :key`;
  const expressionNames = { "#key": key };
  const expressionValues = util2.dynamodb.toMapValues({ ":key": value });
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

// apps/backend/src/appsync/resolvers/Query.productsByTeam.ts
function request(ctx) {
  const {
    args: { teamId, limit, nextToken }
  } = ctx;
  return dynamodbQueryRequest({
    key: "teamId",
    value: teamId,
    index: "productsByTeam",
    limit,
    nextToken
  });
}
function response(ctx) {
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  return ctx.result;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9oZWxwZXJzL2R5bmFtb2RiLnRzIiwgIi4uLy4uLy4uLy4uL2FwcHN5bmMvcmVzb2x2ZXJzL1F1ZXJ5LnByb2R1Y3RzQnlUZWFtLnRzIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBO0FBQUEsRUFXRSxRQUFBQTtBQUFBLE9BQ0s7QUFtRUEsSUFBTSx1QkFBdUIsQ0FBQztBQUFBLEVBQ25DO0FBQUEsRUFDQTtBQUFBLEVBQ0EsUUFBUSxJQUFJO0FBQUEsRUFDWjtBQUFBLEVBQ0EsUUFBUTtBQUFBLEVBQ1IsZ0JBQWdCO0FBQUEsRUFDaEIsWUFBWTtBQUNkLE1BQXVEO0FBQ3JELFFBQU0sU0FBUyxJQUNYLEtBQUssTUFBTUMsTUFBSyxVQUFVLDJCQUEyQixDQUFDLENBQUMsSUFDdkQ7QUFDSixRQUFNLGFBQWE7QUFDbkIsUUFBTSxrQkFBa0IsRUFBRSxRQUFRLElBQUk7QUFDdEMsUUFBTSxtQkFBbUJBLE1BQUssU0FBUyxZQUFZLEVBQUUsUUFBUSxNQUFNLENBQUM7QUFFcEUsUUFBTSxRQUE4QjtBQUFBLElBQ2xDLFdBQVc7QUFBQSxJQUNYLE9BQU8sRUFBRSxZQUFZLGlCQUFpQixpQkFBaUI7QUFBQSxJQUN2RCxPQUFPLFNBQVM7QUFBQSxJQUNoQjtBQUFBLElBQ0E7QUFBQSxJQUNBLGtCQUFrQixrQkFBa0I7QUFBQSxJQUNwQyxRQUFRO0FBQUEsRUFDVjtBQUVBLE1BQUksUUFBUTtBQUNWLFVBQU0sU0FBUztBQUFBLEVBQ2pCO0FBRUEsU0FBTztBQUNUOzs7QUMzR08sU0FBUyxRQUFRLEtBQW9DO0FBQzFELFFBQU07QUFBQSxJQUNKLE1BQU0sRUFBRSxRQUFRLE9BQU8sVUFBVTtBQUFBLEVBQ25DLElBQUk7QUFFSixTQUFPLHFCQUFxQjtBQUFBLElBQzFCLEtBQUs7QUFBQSxJQUNMLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQO0FBQUEsSUFDQTtBQUFBLEVBQ0YsQ0FBQztBQUNIO0FBRU8sU0FBUyxTQUFTLEtBQWM7QUFDckMsUUFBTSxFQUFFLE9BQU8sT0FBTyxJQUFJO0FBRTFCLE1BQUksT0FBTztBQUNULFdBQU8sS0FBSyxZQUFZLE1BQU0sU0FBUyxNQUFNLE1BQU0sTUFBTTtBQUFBLEVBQzNEO0FBRUEsU0FBTyxJQUFJO0FBQ2I7IiwKICAibmFtZXMiOiBbInV0aWwiLCAidXRpbCJdCn0K
