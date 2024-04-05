// apps/backend/src/appsync/resolvers/Query.autocompleteResultsByType.ts
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

// apps/backend/src/appsync/resolvers/Query.autocompleteResultsByType.ts
function request(ctx) {
  const { type, searchName, filter, nextToken } = ctx.args;
  console.log("searchName: ", searchName);
  if (searchName?.length > 0) {
    const query = {
      operation: "Query",
      query: {
        expression: "#type = :type and begins_with(#searchName, :searchName)",
        expressionNames: {
          "#type": "type",
          "#searchName": "searchName"
        },
        expressionValues: util2.dynamodb.toMapValues({
          ":type": type,
          ":searchName": searchName
        })
      },
      index: "autocompleteResultsByType",
      limit: 6,
      nextToken,
      select: "ALL_ATTRIBUTES",
      scanIndexForward: true
    };
    if (filter) {
      query.filter = JSON.parse(
        util2.transform.toDynamoDBFilterExpression(filter)
      );
    }
    console.log("query: ", query);
    return query;
  } else {
    return dynamodbQueryRequest({
      key: "type",
      value: type,
      filter,
      index: "autocompleteResultsByType",
      limit: 20,
      nextToken
    });
  }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvUXVlcnkuYXV0b2NvbXBsZXRlUmVzdWx0c0J5VHlwZS50cyIsICIuLi8uLi8uLi8uLi9hcHBzeW5jL2hlbHBlcnMvZHluYW1vZGIudHMiXSwKICAibWFwcGluZ3MiOiAiO0FBQUEsU0FBd0MsUUFBQUEsYUFBWTs7O0FDQXBEO0FBQUEsRUFXRTtBQUFBLE9BQ0s7QUFtRUEsSUFBTSx1QkFBdUIsQ0FBQztBQUFBLEVBQ25DO0FBQUEsRUFDQTtBQUFBLEVBQ0EsUUFBUSxJQUFJO0FBQUEsRUFDWjtBQUFBLEVBQ0EsUUFBUTtBQUFBLEVBQ1IsZ0JBQWdCO0FBQUEsRUFDaEIsWUFBWTtBQUNkLE1BQXVEO0FBQ3JELFFBQU0sU0FBUyxJQUNYLEtBQUssTUFBTSxLQUFLLFVBQVUsMkJBQTJCLENBQUMsQ0FBQyxJQUN2RDtBQUNKLFFBQU0sYUFBYTtBQUNuQixRQUFNLGtCQUFrQixFQUFFLFFBQVEsSUFBSTtBQUN0QyxRQUFNLG1CQUFtQixLQUFLLFNBQVMsWUFBWSxFQUFFLFFBQVEsTUFBTSxDQUFDO0FBRXBFLFFBQU0sUUFBOEI7QUFBQSxJQUNsQyxXQUFXO0FBQUEsSUFDWCxPQUFPLEVBQUUsWUFBWSxpQkFBaUIsaUJBQWlCO0FBQUEsSUFDdkQsT0FBTyxTQUFTO0FBQUEsSUFDaEI7QUFBQSxJQUNBO0FBQUEsSUFDQSxrQkFBa0Isa0JBQWtCO0FBQUEsSUFDcEMsUUFBUTtBQUFBLEVBQ1Y7QUFFQSxNQUFJLFFBQVE7QUFDVixVQUFNLFNBQVM7QUFBQSxFQUNqQjtBQUVBLFNBQU87QUFDVDs7O0FEM0dPLFNBQVMsUUFBUSxLQUFvQztBQUMxRCxRQUFNLEVBQUUsTUFBTSxZQUFZLFFBQVEsVUFBVSxJQUFJLElBQUk7QUFDcEQsVUFBUSxJQUFJLGdCQUFnQixVQUFVO0FBRXRDLE1BQUksWUFBWSxTQUFTLEdBQUc7QUFDMUIsVUFBTSxRQUE4QjtBQUFBLE1BQ2xDLFdBQVc7QUFBQSxNQUNYLE9BQU87QUFBQSxRQUNMLFlBQVk7QUFBQSxRQUNaLGlCQUFpQjtBQUFBLFVBQ2YsU0FBUztBQUFBLFVBQ1QsZUFBZTtBQUFBLFFBQ2pCO0FBQUEsUUFDQSxrQkFBa0JDLE1BQUssU0FBUyxZQUFZO0FBQUEsVUFDMUMsU0FBUztBQUFBLFVBQ1QsZUFBZTtBQUFBLFFBQ2pCLENBQUM7QUFBQSxNQUNIO0FBQUEsTUFDQSxPQUFPO0FBQUEsTUFDUCxPQUFPO0FBQUEsTUFDUDtBQUFBLE1BQ0EsUUFBUTtBQUFBLE1BQ1Isa0JBQWtCO0FBQUEsSUFDcEI7QUFFQSxRQUFJLFFBQVE7QUFDVixZQUFNLFNBQVMsS0FBSztBQUFBLFFBQ2xCQSxNQUFLLFVBQVUsMkJBQTJCLE1BQU07QUFBQSxNQUNsRDtBQUFBLElBQ0Y7QUFFQSxZQUFRLElBQUksV0FBVyxLQUFLO0FBRTVCLFdBQU87QUFBQSxFQUNULE9BQU87QUFDTCxXQUFPLHFCQUFxQjtBQUFBLE1BQzFCLEtBQUs7QUFBQSxNQUNMLE9BQU87QUFBQSxNQUNQO0FBQUEsTUFDQSxPQUFPO0FBQUEsTUFDUCxPQUFPO0FBQUEsTUFDUDtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFDRjtBQUVPLFNBQVMsU0FBUyxLQUFjO0FBQ3JDLFFBQU0sRUFBRSxPQUFPLE9BQU8sSUFBSTtBQUMxQixVQUFRLElBQUksWUFBWSxNQUFNO0FBQzlCLE1BQUksT0FBTztBQUNULFdBQU9BLE1BQUssWUFBWSxNQUFNLFNBQVMsTUFBTSxNQUFNLE1BQU07QUFBQSxFQUMzRDtBQUNBLFFBQU0sRUFBRSxRQUFRLENBQUMsR0FBRyxVQUFVLElBQUk7QUFDbEMsU0FBTyxFQUFFLE9BQU8sVUFBVTtBQUM1QjsiLAogICJuYW1lcyI6IFsidXRpbCIsICJ1dGlsIl0KfQo=
