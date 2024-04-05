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

// apps/backend/src/appsync/resolvers/Query.tasksByEntityFrom1.ts
function request(ctx) {
  const {
    args: { entityId, status, limit, nextToken, sortDirection, filter }
  } = ctx;
  return dynamodbQueryRequest({
    key: "fromSearchStatus",
    value: `${entityId}#${status}`,
    index: "tasksByEntityFrom",
    filter,
    limit,
    nextToken,
    sortDirection
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9oZWxwZXJzL2R5bmFtb2RiLnRzIiwgIi4uLy4uLy4uLy4uL2FwcHN5bmMvcmVzb2x2ZXJzL1F1ZXJ5LnRhc2tzQnlFbnRpdHlGcm9tMS50cyJdLAogICJtYXBwaW5ncyI6ICI7QUFBQTtBQUFBLEVBV0UsUUFBQUE7QUFBQSxPQUNLO0FBbUVBLElBQU0sdUJBQXVCLENBQUM7QUFBQSxFQUNuQztBQUFBLEVBQ0E7QUFBQSxFQUNBLFFBQVEsSUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUNBLFFBQVE7QUFBQSxFQUNSLGdCQUFnQjtBQUFBLEVBQ2hCLFlBQVk7QUFDZCxNQUF1RDtBQUNyRCxRQUFNLFNBQVMsSUFDWCxLQUFLLE1BQU1DLE1BQUssVUFBVSwyQkFBMkIsQ0FBQyxDQUFDLElBQ3ZEO0FBQ0osUUFBTSxhQUFhO0FBQ25CLFFBQU0sa0JBQWtCLEVBQUUsUUFBUSxJQUFJO0FBQ3RDLFFBQU0sbUJBQW1CQSxNQUFLLFNBQVMsWUFBWSxFQUFFLFFBQVEsTUFBTSxDQUFDO0FBRXBFLFFBQU0sUUFBOEI7QUFBQSxJQUNsQyxXQUFXO0FBQUEsSUFDWCxPQUFPLEVBQUUsWUFBWSxpQkFBaUIsaUJBQWlCO0FBQUEsSUFDdkQsT0FBTyxTQUFTO0FBQUEsSUFDaEI7QUFBQSxJQUNBO0FBQUEsSUFDQSxrQkFBa0Isa0JBQWtCO0FBQUEsSUFDcEMsUUFBUTtBQUFBLEVBQ1Y7QUFFQSxNQUFJLFFBQVE7QUFDVixVQUFNLFNBQVM7QUFBQSxFQUNqQjtBQUVBLFNBQU87QUFDVDs7O0FDM0dPLFNBQVMsUUFBUSxLQUFvQztBQUMxRCxRQUFNO0FBQUEsSUFDSixNQUFNLEVBQUUsVUFBVSxRQUFRLE9BQU8sV0FBVyxlQUFlLE9BQU87QUFBQSxFQUNwRSxJQUFJO0FBRUosU0FBTyxxQkFBcUI7QUFBQSxJQUMxQixLQUFLO0FBQUEsSUFDTCxPQUFPLEdBQUcsWUFBWTtBQUFBLElBQ3RCLE9BQU87QUFBQSxJQUNQO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRixDQUFDO0FBQ0g7QUFFTyxTQUFTLFNBQVMsS0FBYztBQUNyQyxRQUFNLEVBQUUsT0FBTyxPQUFPLElBQUk7QUFFMUIsTUFBSSxPQUFPO0FBQ1QsV0FBTyxLQUFLLFlBQVksTUFBTSxTQUFTLE1BQU0sTUFBTSxNQUFNO0FBQUEsRUFDM0Q7QUFFQSxTQUFPLElBQUk7QUFDYjsiLAogICJuYW1lcyI6IFsidXRpbCIsICJ1dGlsIl0KfQo=
