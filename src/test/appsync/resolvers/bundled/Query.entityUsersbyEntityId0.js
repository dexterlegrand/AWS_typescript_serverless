// apps/backend/src/appsync/resolvers/Query.entityUsersByEntityId0.ts
import {
  util as util2
} from "@aws-appsync/utils";

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

// apps/backend/src/appsync/resolvers/Query.entityUsersByEntityId0.ts
function request(ctx) {
  console.log("Query.tasksByEntityFrom0.ts request ctx: ", ctx);
  const { sub } = ctx.identity;
  const { entityId } = ctx.args;
  return dynamoDBGetItemRequest({
    userId: sub,
    entityId
  });
}
function response(ctx) {
  console.log("Query.tasksByEntityFrom0.ts response ctx: ", ctx);
  const { sub } = ctx.identity;
  const { error, result } = ctx;
  if (!result?.userId || result?.userId !== sub) {
    util2.unauthorized();
  }
  if (error) {
    return util2.appendError(error.message, error.type, result);
  }
  return ctx.result;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvUXVlcnkuZW50aXR5VXNlcnNCeUVudGl0eUlkMC50cyIsICIuLi8uLi8uLi8uLi9hcHBzeW5jL2hlbHBlcnMvZHluYW1vZGIudHMiXSwKICAibWFwcGluZ3MiOiAiO0FBQUE7QUFBQSxFQUlFLFFBQUFBO0FBQUEsT0FDSzs7O0FDTFA7QUFBQSxFQVdFO0FBQUEsT0FDSztBQXNDQSxJQUFNLHlCQUF5QixDQUFDLFFBQXFDO0FBQzFFLFNBQU87QUFBQSxJQUNMLFdBQVc7QUFBQSxJQUNYLEtBQUssS0FBSyxTQUFTLFlBQVksR0FBRztBQUFBLEVBQ3BDO0FBQ0Y7OztBRC9DTyxTQUFTLFFBQVEsS0FBc0M7QUFDNUQsVUFBUSxJQUFJLDZDQUE2QyxHQUFHO0FBQzVELFFBQU0sRUFBRSxJQUFJLElBQUksSUFBSTtBQUNwQixRQUFNLEVBQUUsU0FBUyxJQUFJLElBQUk7QUFFekIsU0FBTyx1QkFBdUI7QUFBQSxJQUM1QixRQUFRO0FBQUEsSUFDUjtBQUFBLEVBQ0YsQ0FBQztBQUNIO0FBRU8sU0FBUyxTQUFTLEtBQWM7QUFDckMsVUFBUSxJQUFJLDhDQUE4QyxHQUFHO0FBQzdELFFBQU0sRUFBRSxJQUFJLElBQUksSUFBSTtBQUNwQixRQUFNLEVBQUUsT0FBTyxPQUFPLElBQUk7QUFFMUIsTUFBSSxDQUFDLFFBQVEsVUFBVSxRQUFRLFdBQVcsS0FBSztBQUM3QyxJQUFBQyxNQUFLLGFBQWE7QUFBQSxFQUNwQjtBQUVBLE1BQUksT0FBTztBQUNULFdBQU9BLE1BQUssWUFBWSxNQUFNLFNBQVMsTUFBTSxNQUFNLE1BQU07QUFBQSxFQUMzRDtBQUVBLFNBQU8sSUFBSTtBQUNiOyIsCiAgIm5hbWVzIjogWyJ1dGlsIiwgInV0aWwiXQp9Cg==
