// apps/backend/src/appsync/resolvers/listAdmins.ts
import { util as util2 } from "@aws-appsync/utils";

// apps/backend/src/appsync/helpers/dynamodb.ts
import {
  util
} from "@aws-appsync/utils";
var dynamoDBScanRequest = ({
  filter: f,
  limit,
  nextToken
}) => {
  const filter = f ? JSON.parse(util.transform.toDynamoDBFilterExpression(f)) : void 0;
  return { operation: "Scan", filter, limit, nextToken };
};

// apps/backend/src/appsync/resolvers/listAdmins.ts
function request(ctx) {
  const { filter, limit = 20, nextToken } = ctx.args;
  return dynamoDBScanRequest({ filter, limit, nextToken });
}
function response(ctx) {
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvbGlzdEFkbWlucy50cyIsICIuLi8uLi8uLi8uLi9hcHBzeW5jL2hlbHBlcnMvZHluYW1vZGIudHMiXSwKICAibWFwcGluZ3MiOiAiO0FBQUEsU0FBa0IsUUFBQUEsYUFBaUM7OztBQ0FuRDtBQUFBLEVBV0U7QUFBQSxPQUNLO0FBb0dBLElBQU0sc0JBQXNCLENBQUM7QUFBQSxFQUNsQyxRQUFRO0FBQUEsRUFDUjtBQUFBLEVBQ0E7QUFDRixNQUFxRDtBQUNuRCxRQUFNLFNBQVMsSUFDWCxLQUFLLE1BQU0sS0FBSyxVQUFVLDJCQUEyQixDQUFDLENBQUMsSUFDdkQ7QUFFSixTQUFPLEVBQUUsV0FBVyxRQUFRLFFBQVEsT0FBTyxVQUFVO0FBQ3ZEOzs7QUR2SE8sU0FBUyxRQUFRLEtBQW1DO0FBQ3pELFFBQU0sRUFBRSxRQUFRLFFBQVEsSUFBSSxVQUFVLElBQUksSUFBSTtBQUM5QyxTQUFPLG9CQUFvQixFQUFFLFFBQVEsT0FBTyxVQUFVLENBQUM7QUFDekQ7QUFFTyxTQUFTLFNBQVMsS0FBYztBQUNyQyxRQUFNLEVBQUUsT0FBTyxPQUFPLElBQUk7QUFDMUIsTUFBSSxPQUFPO0FBQ1QsV0FBT0MsTUFBSyxZQUFZLE1BQU0sU0FBUyxNQUFNLE1BQU0sTUFBTTtBQUFBLEVBQzNEO0FBQ0EsUUFBTSxFQUFFLFFBQVEsQ0FBQyxHQUFHLFVBQVUsSUFBSTtBQUNsQyxTQUFPLEVBQUUsT0FBTyxVQUFVO0FBQzVCOyIsCiAgIm5hbWVzIjogWyJ1dGlsIiwgInV0aWwiXQp9Cg==
