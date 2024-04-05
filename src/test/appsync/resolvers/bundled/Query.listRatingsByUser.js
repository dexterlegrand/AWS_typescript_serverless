// apps/backend/src/appsync/resolvers/Query.listRatingsByUser.ts
import {
  util as util3
} from "@aws-appsync/utils";

// apps/backend/src/appsync/helpers/cognito.ts
import { util } from "@aws-appsync/utils";
var USER_GROUPS = {
  SUPER_ADMINS: "SuperAdmins",
  ADMINS: "Admins",
  USERS: "Users"
};
var isAdmin = (groups) => {
  return groups?.includes(USER_GROUPS.SUPER_ADMINS) || groups?.includes(USER_GROUPS.ADMINS);
};

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

// apps/backend/src/appsync/resolvers/Query.listRatingsByUser.ts
function request(ctx) {
  const { sub, groups } = ctx.identity;
  const { owner, filter, limit = 20, nextToken } = ctx.args;
  const userId = util3.authType() !== "IAM Authorization" && !isAdmin(groups) ? sub : owner;
  return dynamodbQueryRequest({
    key: "owner",
    value: userId,
    index: "ratingsByUser",
    filter,
    limit,
    nextToken
  });
}
function response(ctx) {
  const { error, result } = ctx;
  if (error) {
    return util3.appendError(error.message, error.type, result);
  }
  return result;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvUXVlcnkubGlzdFJhdGluZ3NCeVVzZXIudHMiLCAiLi4vLi4vLi4vLi4vYXBwc3luYy9oZWxwZXJzL2NvZ25pdG8udHMiLCAiLi4vLi4vLi4vLi4vYXBwc3luYy9oZWxwZXJzL2R5bmFtb2RiLnRzIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBO0FBQUEsRUFFRSxRQUFBQTtBQUFBLE9BR0s7OztBQ0xQLFNBQVMsWUFBaUM7QUFDbkMsSUFBTSxjQUFjO0FBQUEsRUFDekIsY0FBYztBQUFBLEVBQ2QsUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUNUO0FBU08sSUFBTSxVQUFVLENBQUMsV0FBNEI7QUFDbEQsU0FDRSxRQUFRLFNBQVMsWUFBWSxZQUFZLEtBQ3pDLFFBQVEsU0FBUyxZQUFZLE1BQU07QUFFdkM7OztBQ25CQTtBQUFBLEVBV0UsUUFBQUM7QUFBQSxPQUNLO0FBbUVBLElBQU0sdUJBQXVCLENBQUM7QUFBQSxFQUNuQztBQUFBLEVBQ0E7QUFBQSxFQUNBLFFBQVEsSUFBSTtBQUFBLEVBQ1o7QUFBQSxFQUNBLFFBQVE7QUFBQSxFQUNSLGdCQUFnQjtBQUFBLEVBQ2hCLFlBQVk7QUFDZCxNQUF1RDtBQUNyRCxRQUFNLFNBQVMsSUFDWCxLQUFLLE1BQU1DLE1BQUssVUFBVSwyQkFBMkIsQ0FBQyxDQUFDLElBQ3ZEO0FBQ0osUUFBTSxhQUFhO0FBQ25CLFFBQU0sa0JBQWtCLEVBQUUsUUFBUSxJQUFJO0FBQ3RDLFFBQU0sbUJBQW1CQSxNQUFLLFNBQVMsWUFBWSxFQUFFLFFBQVEsTUFBTSxDQUFDO0FBRXBFLFFBQU0sUUFBOEI7QUFBQSxJQUNsQyxXQUFXO0FBQUEsSUFDWCxPQUFPLEVBQUUsWUFBWSxpQkFBaUIsaUJBQWlCO0FBQUEsSUFDdkQsT0FBTyxTQUFTO0FBQUEsSUFDaEI7QUFBQSxJQUNBO0FBQUEsSUFDQSxrQkFBa0Isa0JBQWtCO0FBQUEsSUFDcEMsUUFBUTtBQUFBLEVBQ1Y7QUFFQSxNQUFJLFFBQVE7QUFDVixVQUFNLFNBQVM7QUFBQSxFQUNqQjtBQUVBLFNBQU87QUFDVDs7O0FGckdPLFNBQVMsUUFBUSxLQUFvQztBQUMxRCxRQUFNLEVBQUUsS0FBSyxPQUFPLElBQUksSUFBSTtBQUM1QixRQUFNLEVBQUUsT0FBTyxRQUFRLFFBQVEsSUFBSSxVQUFVLElBQUksSUFBSTtBQUVyRCxRQUFNLFNBQ0pDLE1BQUssU0FBUyxNQUFNLHVCQUF1QixDQUFDLFFBQVEsTUFBTSxJQUFJLE1BQU07QUFFdEUsU0FBTyxxQkFBcUI7QUFBQSxJQUMxQixLQUFLO0FBQUEsSUFDTCxPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUDtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRixDQUFDO0FBQ0g7QUFFTyxTQUFTLFNBQVMsS0FBYztBQUNyQyxRQUFNLEVBQUUsT0FBTyxPQUFPLElBQUk7QUFDMUIsTUFBSSxPQUFPO0FBQ1QsV0FBT0EsTUFBSyxZQUFZLE1BQU0sU0FBUyxNQUFNLE1BQU0sTUFBTTtBQUFBLEVBQzNEO0FBQ0EsU0FBTztBQUNUOyIsCiAgIm5hbWVzIjogWyJ1dGlsIiwgInV0aWwiLCAidXRpbCIsICJ1dGlsIl0KfQo=
