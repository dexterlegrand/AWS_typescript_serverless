// apps/backend/src/appsync/resolvers/Task.taskPayments.ts
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

// apps/backend/src/appsync/resolvers/Task.taskPayments.ts
function request(ctx) {
  const { id, nextToken, limit = 20 } = ctx.source;
  console.log("Task.taskPayments request ctx: ", ctx);
  return dynamodbQueryRequest({
    key: "taskId",
    index: "taskPaymentsByTask",
    value: id,
    limit,
    nextToken
  });
}
function response(ctx) {
  console.log("Task.taskPayments response ctx: ", ctx);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvVGFzay50YXNrUGF5bWVudHMudHMiLCAiLi4vLi4vLi4vLi4vYXBwc3luYy9oZWxwZXJzL2R5bmFtb2RiLnRzIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBLFNBQXdDLFFBQUFBLGFBQVk7OztBQ0FwRDtBQUFBLEVBV0U7QUFBQSxPQUNLO0FBbUVBLElBQU0sdUJBQXVCLENBQUM7QUFBQSxFQUNuQztBQUFBLEVBQ0E7QUFBQSxFQUNBLFFBQVEsSUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUNBLFFBQVE7QUFBQSxFQUNSLGdCQUFnQjtBQUFBLEVBQ2hCLFlBQVk7QUFDZCxNQUF1RDtBQUNyRCxRQUFNLFNBQVMsSUFDWCxLQUFLLE1BQU0sS0FBSyxVQUFVLDJCQUEyQixDQUFDLENBQUMsSUFDdkQ7QUFDSixRQUFNLGFBQWE7QUFDbkIsUUFBTSxrQkFBa0IsRUFBRSxRQUFRLElBQUk7QUFDdEMsUUFBTSxtQkFBbUIsS0FBSyxTQUFTLFlBQVksRUFBRSxRQUFRLE1BQU0sQ0FBQztBQUVwRSxRQUFNLFFBQThCO0FBQUEsSUFDbEMsV0FBVztBQUFBLElBQ1gsT0FBTyxFQUFFLFlBQVksaUJBQWlCLGlCQUFpQjtBQUFBLElBQ3ZELE9BQU8sU0FBUztBQUFBLElBQ2hCO0FBQUEsSUFDQTtBQUFBLElBQ0Esa0JBQWtCLGtCQUFrQjtBQUFBLElBQ3BDLFFBQVE7QUFBQSxFQUNWO0FBRUEsTUFBSSxRQUFRO0FBQ1YsVUFBTSxTQUFTO0FBQUEsRUFDakI7QUFFQSxTQUFPO0FBQ1Q7OztBRDNHTyxTQUFTLFFBQVEsS0FBb0M7QUFDMUQsUUFBTSxFQUFFLElBQUksV0FBVyxRQUFRLEdBQUcsSUFBSSxJQUFJO0FBRTFDLFVBQVEsSUFBSSxtQ0FBbUMsR0FBRztBQUVsRCxTQUFPLHFCQUFxQjtBQUFBLElBQzFCLEtBQUs7QUFBQSxJQUNMLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQO0FBQUEsSUFDQTtBQUFBLEVBQ0YsQ0FBQztBQUNIO0FBRU8sU0FBUyxTQUFTLEtBQWM7QUFDckMsVUFBUSxJQUFJLG9DQUFvQyxHQUFHO0FBQ25ELFFBQU0sRUFBRSxPQUFPLE9BQU8sSUFBSTtBQUMxQixNQUFJLE9BQU87QUFDVCxXQUFPQyxNQUFLLFlBQVksTUFBTSxTQUFTLE1BQU0sTUFBTSxNQUFNO0FBQUEsRUFDM0Q7QUFDQSxRQUFNLEVBQUUsUUFBUSxDQUFDLEdBQUcsVUFBVSxJQUFJO0FBQ2xDLFNBQU8sRUFBRSxPQUFPLFVBQVU7QUFDNUI7IiwKICAibmFtZXMiOiBbInV0aWwiLCAidXRpbCJdCn0K
