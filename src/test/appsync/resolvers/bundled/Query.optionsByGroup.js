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

// apps/backend/src/appsync/resolvers/Query.optionsByGroup.ts
function request(ctx) {
  console.log("optionsByGroup ctx: ", ctx);
  const { group, nextToken } = ctx.args;
  return dynamodbQueryRequest({
    key: "group",
    value: group,
    index: "optionsByGroup",
    limit: 20,
    nextToken
  });
}
function response(ctx) {
  const { error, result } = ctx;
  console.log("result: ", result);
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  const { items = [], nextToken } = result;
  return { items, nextToken };
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9oZWxwZXJzL2R5bmFtb2RiLnRzIiwgIi4uLy4uLy4uLy4uL2FwcHN5bmMvcmVzb2x2ZXJzL1F1ZXJ5Lm9wdGlvbnNCeUdyb3VwLnRzIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBO0FBQUEsRUFXRSxRQUFBQTtBQUFBLE9BQ0s7QUFtRUEsSUFBTSx1QkFBdUIsQ0FBQztBQUFBLEVBQ25DO0FBQUEsRUFDQTtBQUFBLEVBQ0EsUUFBUSxJQUFJO0FBQUEsRUFDWjtBQUFBLEVBQ0EsUUFBUTtBQUFBLEVBQ1IsZ0JBQWdCO0FBQUEsRUFDaEIsWUFBWTtBQUNkLE1BQXVEO0FBQ3JELFFBQU0sU0FBUyxJQUNYLEtBQUssTUFBTUMsTUFBSyxVQUFVLDJCQUEyQixDQUFDLENBQUMsSUFDdkQ7QUFDSixRQUFNLGFBQWE7QUFDbkIsUUFBTSxrQkFBa0IsRUFBRSxRQUFRLElBQUk7QUFDdEMsUUFBTSxtQkFBbUJBLE1BQUssU0FBUyxZQUFZLEVBQUUsUUFBUSxNQUFNLENBQUM7QUFFcEUsUUFBTSxRQUE4QjtBQUFBLElBQ2xDLFdBQVc7QUFBQSxJQUNYLE9BQU8sRUFBRSxZQUFZLGlCQUFpQixpQkFBaUI7QUFBQSxJQUN2RCxPQUFPLFNBQVM7QUFBQSxJQUNoQjtBQUFBLElBQ0E7QUFBQSxJQUNBLGtCQUFrQixrQkFBa0I7QUFBQSxJQUNwQyxRQUFRO0FBQUEsRUFDVjtBQUVBLE1BQUksUUFBUTtBQUNWLFVBQU0sU0FBUztBQUFBLEVBQ2pCO0FBRUEsU0FBTztBQUNUOzs7QUMzR08sU0FBUyxRQUFRLEtBQW9DO0FBQzFELFVBQVEsSUFBSSx3QkFBd0IsR0FBRztBQUN2QyxRQUFNLEVBQUUsT0FBTyxVQUFVLElBQUksSUFBSTtBQUVqQyxTQUFPLHFCQUFxQjtBQUFBLElBQzFCLEtBQUs7QUFBQSxJQUNMLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQO0FBQUEsRUFDRixDQUFDO0FBQ0g7QUFFTyxTQUFTLFNBQVMsS0FBYztBQUNyQyxRQUFNLEVBQUUsT0FBTyxPQUFPLElBQUk7QUFDMUIsVUFBUSxJQUFJLFlBQVksTUFBTTtBQUU5QixNQUFJLE9BQU87QUFDVCxXQUFPLEtBQUssWUFBWSxNQUFNLFNBQVMsTUFBTSxNQUFNLE1BQU07QUFBQSxFQUMzRDtBQUNBLFFBQU0sRUFBRSxRQUFRLENBQUMsR0FBRyxVQUFVLElBQUk7QUFDbEMsU0FBTyxFQUFFLE9BQU8sVUFBVTtBQUM1QjsiLAogICJuYW1lcyI6IFsidXRpbCIsICJ1dGlsIl0KfQo=
