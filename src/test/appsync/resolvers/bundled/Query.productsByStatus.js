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

// apps/backend/src/appsync/resolvers/Query.productsByStatus.ts
function request(ctx) {
  const {
    args: { status, limit, nextToken }
  } = ctx;
  return dynamodbQueryRequest({
    key: "status",
    value: status,
    index: "productsByStatus",
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9oZWxwZXJzL2R5bmFtb2RiLnRzIiwgIi4uLy4uLy4uLy4uL2FwcHN5bmMvcmVzb2x2ZXJzL1F1ZXJ5LnByb2R1Y3RzQnlTdGF0dXMudHMiXSwKICAibWFwcGluZ3MiOiAiO0FBQUE7QUFBQSxFQVdFLFFBQUFBO0FBQUEsT0FDSztBQW1FQSxJQUFNLHVCQUF1QixDQUFDO0FBQUEsRUFDbkM7QUFBQSxFQUNBO0FBQUEsRUFDQSxRQUFRLElBQUk7QUFBQSxFQUNaO0FBQUEsRUFDQSxRQUFRO0FBQUEsRUFDUixnQkFBZ0I7QUFBQSxFQUNoQixZQUFZO0FBQ2QsTUFBdUQ7QUFDckQsUUFBTSxTQUFTLElBQ1gsS0FBSyxNQUFNQyxNQUFLLFVBQVUsMkJBQTJCLENBQUMsQ0FBQyxJQUN2RDtBQUNKLFFBQU0sYUFBYTtBQUNuQixRQUFNLGtCQUFrQixFQUFFLFFBQVEsSUFBSTtBQUN0QyxRQUFNLG1CQUFtQkEsTUFBSyxTQUFTLFlBQVksRUFBRSxRQUFRLE1BQU0sQ0FBQztBQUVwRSxRQUFNLFFBQThCO0FBQUEsSUFDbEMsV0FBVztBQUFBLElBQ1gsT0FBTyxFQUFFLFlBQVksaUJBQWlCLGlCQUFpQjtBQUFBLElBQ3ZELE9BQU8sU0FBUztBQUFBLElBQ2hCO0FBQUEsSUFDQTtBQUFBLElBQ0Esa0JBQWtCLGtCQUFrQjtBQUFBLElBQ3BDLFFBQVE7QUFBQSxFQUNWO0FBRUEsTUFBSSxRQUFRO0FBQ1YsVUFBTSxTQUFTO0FBQUEsRUFDakI7QUFFQSxTQUFPO0FBQ1Q7OztBQzNHTyxTQUFTLFFBQVEsS0FBb0M7QUFDMUQsUUFBTTtBQUFBLElBQ0osTUFBTSxFQUFFLFFBQVEsT0FBTyxVQUFVO0FBQUEsRUFDbkMsSUFBSTtBQUVKLFNBQU8scUJBQXFCO0FBQUEsSUFDMUIsS0FBSztBQUFBLElBQ0wsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1A7QUFBQSxJQUNBO0FBQUEsRUFDRixDQUFDO0FBQ0g7QUFFTyxTQUFTLFNBQVMsS0FBYztBQUNyQyxRQUFNLEVBQUUsT0FBTyxPQUFPLElBQUk7QUFFMUIsTUFBSSxPQUFPO0FBQ1QsV0FBTyxLQUFLLFlBQVksTUFBTSxTQUFTLE1BQU0sTUFBTSxNQUFNO0FBQUEsRUFDM0Q7QUFFQSxTQUFPLElBQUk7QUFDYjsiLAogICJuYW1lcyI6IFsidXRpbCIsICJ1dGlsIl0KfQo=
