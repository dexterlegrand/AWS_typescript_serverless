// apps/backend/src/appsync/resolvers/getMessage.ts
import { util as util2 } from "@aws-appsync/utils";

// apps/backend/src/appsync/helpers/dynamodb.ts
import {
  util
} from "@aws-appsync/utils";
var dynamoDBGetItemRequest = (key) => {
  return {
    operation: "GetItem",
    key: util.dynamodb.toMapValues(key)
  };
};

// apps/backend/src/appsync/resolvers/getMessage.ts
function request(ctx) {
  const {
    args: { id }
  } = ctx;
  return dynamoDBGetItemRequest({ id });
}
function response(ctx) {
  const { error, result } = ctx;
  if (error) {
    return util2.appendError(error.message, error.type, result);
  }
  return ctx.result;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvZ2V0TWVzc2FnZS50cyIsICIuLi8uLi8uLi8uLi9hcHBzeW5jL2hlbHBlcnMvZHluYW1vZGIudHMiXSwKICAibWFwcGluZ3MiOiAiO0FBQUEsU0FBa0IsUUFBQUEsYUFBb0M7OztBQ0F0RDtBQUFBLEVBV0U7QUFBQSxPQUNLO0FBc0NBLElBQU0seUJBQXlCLENBQUMsUUFBcUM7QUFDMUUsU0FBTztBQUFBLElBQ0wsV0FBVztBQUFBLElBQ1gsS0FBSyxLQUFLLFNBQVMsWUFBWSxHQUFHO0FBQUEsRUFDcEM7QUFDRjs7O0FEcERPLFNBQVMsUUFBUSxLQUFzQztBQUM1RCxRQUFNO0FBQUEsSUFDSixNQUFNLEVBQUUsR0FBRztBQUFBLEVBQ2IsSUFBSTtBQUNKLFNBQU8sdUJBQXVCLEVBQUUsR0FBRyxDQUFDO0FBQ3RDO0FBRU8sU0FBUyxTQUFTLEtBQWM7QUFDckMsUUFBTSxFQUFFLE9BQU8sT0FBTyxJQUFJO0FBQzFCLE1BQUksT0FBTztBQUNULFdBQU9DLE1BQUssWUFBWSxNQUFNLFNBQVMsTUFBTSxNQUFNLE1BQU07QUFBQSxFQUMzRDtBQUNBLFNBQU8sSUFBSTtBQUNiOyIsCiAgIm5hbWVzIjogWyJ1dGlsIiwgInV0aWwiXQp9Cg==
