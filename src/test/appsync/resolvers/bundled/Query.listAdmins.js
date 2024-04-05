// apps/backend/src/appsync/resolvers/Query.listAdmins.ts
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

// apps/backend/src/appsync/helpers/dynamodb.ts
import {
  util as util2
} from "@aws-appsync/utils";
var dynamoDBScanRequest = ({
  filter: f,
  limit,
  nextToken
}) => {
  const filter = f ? JSON.parse(util2.transform.toDynamoDBFilterExpression(f)) : void 0;
  return { operation: "Scan", filter, limit, nextToken };
};

// apps/backend/src/appsync/resolvers/Query.listAdmins.ts
function request(ctx) {
  const { filter, limit = 20, nextToken } = ctx.args;
  const { groups } = ctx.identity;
  if (!groups || !groups?.includes(USER_GROUPS.SUPER_ADMINS)) {
    util3.unauthorized();
  }
  return dynamoDBScanRequest({ filter, limit, nextToken });
}
function response(ctx) {
  const { error, result } = ctx;
  if (error) {
    return util3.appendError(error.message, error.type, result);
  }
  const { items = [], nextToken } = result;
  return { items, nextToken };
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvUXVlcnkubGlzdEFkbWlucy50cyIsICIuLi8uLi8uLi8uLi9hcHBzeW5jL2hlbHBlcnMvY29nbml0by50cyIsICIuLi8uLi8uLi8uLi9hcHBzeW5jL2hlbHBlcnMvZHluYW1vZGIudHMiXSwKICAibWFwcGluZ3MiOiAiO0FBQUE7QUFBQSxFQUVFLFFBQUFBO0FBQUEsT0FHSzs7O0FDTFAsU0FBUyxZQUFpQztBQUNuQyxJQUFNLGNBQWM7QUFBQSxFQUN6QixjQUFjO0FBQUEsRUFDZCxRQUFRO0FBQUEsRUFDUixPQUFPO0FBQ1Q7OztBQ0xBO0FBQUEsRUFXRSxRQUFBQztBQUFBLE9BQ0s7QUFvR0EsSUFBTSxzQkFBc0IsQ0FBQztBQUFBLEVBQ2xDLFFBQVE7QUFBQSxFQUNSO0FBQUEsRUFDQTtBQUNGLE1BQXFEO0FBQ25ELFFBQU0sU0FBUyxJQUNYLEtBQUssTUFBTUMsTUFBSyxVQUFVLDJCQUEyQixDQUFDLENBQUMsSUFDdkQ7QUFFSixTQUFPLEVBQUUsV0FBVyxRQUFRLFFBQVEsT0FBTyxVQUFVO0FBQ3ZEOzs7QUZqSE8sU0FBUyxRQUFRLEtBQW1DO0FBQ3pELFFBQU0sRUFBRSxRQUFRLFFBQVEsSUFBSSxVQUFVLElBQUksSUFBSTtBQUM5QyxRQUFNLEVBQUUsT0FBTyxJQUFJLElBQUk7QUFDdkIsTUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLFNBQVMsWUFBWSxZQUFZLEdBQUc7QUFDMUQsSUFBQUMsTUFBSyxhQUFhO0FBQUEsRUFDcEI7QUFFQSxTQUFPLG9CQUFvQixFQUFFLFFBQVEsT0FBTyxVQUFVLENBQUM7QUFDekQ7QUFFTyxTQUFTLFNBQVMsS0FBYztBQUNyQyxRQUFNLEVBQUUsT0FBTyxPQUFPLElBQUk7QUFDMUIsTUFBSSxPQUFPO0FBQ1QsV0FBT0EsTUFBSyxZQUFZLE1BQU0sU0FBUyxNQUFNLE1BQU0sTUFBTTtBQUFBLEVBQzNEO0FBQ0EsUUFBTSxFQUFFLFFBQVEsQ0FBQyxHQUFHLFVBQVUsSUFBSTtBQUNsQyxTQUFPLEVBQUUsT0FBTyxVQUFVO0FBQzVCOyIsCiAgIm5hbWVzIjogWyJ1dGlsIiwgInV0aWwiLCAidXRpbCIsICJ1dGlsIl0KfQo=
