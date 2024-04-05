// apps/backend/src/appsync/resolvers/Query.getTask.ts
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

// apps/backend/src/appsync/resolvers/Query.getTask.ts
function request(ctx) {
  const {
    args: { entityId, id }
  } = ctx;
  return dynamoDBGetItemRequest({ entityId, id });
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvUXVlcnkuZ2V0VGFzay50cyIsICIuLi8uLi8uLi8uLi9hcHBzeW5jL2hlbHBlcnMvZHluYW1vZGIudHMiXSwKICAibWFwcGluZ3MiOiAiO0FBQUEsU0FBa0IsUUFBQUEsYUFBb0M7OztBQ0F0RDtBQUFBLEVBV0U7QUFBQSxPQUNLO0FBc0NBLElBQU0seUJBQXlCLENBQUMsUUFBcUM7QUFDMUUsU0FBTztBQUFBLElBQ0wsV0FBVztBQUFBLElBQ1gsS0FBSyxLQUFLLFNBQVMsWUFBWSxHQUFHO0FBQUEsRUFDcEM7QUFDRjs7O0FEcERPLFNBQVMsUUFBUSxLQUFzQztBQUM1RCxRQUFNO0FBQUEsSUFDSixNQUFNLEVBQUUsVUFBVSxHQUFHO0FBQUEsRUFDdkIsSUFBSTtBQUNKLFNBQU8sdUJBQXVCLEVBQUUsVUFBVSxHQUFHLENBQUM7QUFDaEQ7QUFFTyxTQUFTLFNBQVMsS0FBYztBQUNyQyxRQUFNLEVBQUUsT0FBTyxPQUFPLElBQUk7QUFDMUIsTUFBSSxPQUFPO0FBQ1QsV0FBT0MsTUFBSyxZQUFZLE1BQU0sU0FBUyxNQUFNLE1BQU0sTUFBTTtBQUFBLEVBQzNEO0FBQ0EsU0FBTyxJQUFJO0FBQ2I7IiwKICAibmFtZXMiOiBbInV0aWwiLCAidXRpbCJdCn0K
