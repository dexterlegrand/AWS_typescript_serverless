// apps/backend/src/appsync/resolvers/Mutation.createTask0.ts
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

// apps/backend/src/appsync/resolvers/Mutation.createTask0.ts
function request(ctx) {
  console.log("create task0 ctx: ", ctx);
  const { sub } = ctx.identity;
  const { direction, entityIdTo, entityIdFrom } = ctx.arguments.input;
  let entityId;
  if (direction === "RECEIVING") {
    entityId = entityIdTo;
  } else if (direction === "SENDING") {
    entityId = entityIdTo;
  } else if (direction === "ON_BEHALF_OF") {
    entityId = entityIdFrom;
  }
  return dynamoDBGetItemRequest({
    userId: sub,
    entityId
  });
}
function response(ctx) {
  console.log("entity user check: ", ctx);
  const { sub } = ctx.identity;
  const { error, result } = ctx;
  if (!result?.userId || result.userId !== sub) {
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvTXV0YXRpb24uY3JlYXRlVGFzazAudHMiLCAiLi4vLi4vLi4vLi4vYXBwc3luYy9oZWxwZXJzL2R5bmFtb2RiLnRzIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBO0FBQUEsRUFJRSxRQUFBQTtBQUFBLE9BQ0s7OztBQ0xQO0FBQUEsRUFXRTtBQUFBLE9BQ0s7QUFzQ0EsSUFBTSx5QkFBeUIsQ0FBQyxRQUFxQztBQUMxRSxTQUFPO0FBQUEsSUFDTCxXQUFXO0FBQUEsSUFDWCxLQUFLLEtBQUssU0FBUyxZQUFZLEdBQUc7QUFBQSxFQUNwQztBQUNGOzs7QUQvQ08sU0FBUyxRQUFRLEtBQXNDO0FBQzVELFVBQVEsSUFBSSxzQkFBc0IsR0FBRztBQUNyQyxRQUFNLEVBQUUsSUFBSSxJQUFJLElBQUk7QUFDcEIsUUFBTSxFQUFFLFdBQVcsWUFBWSxhQUFhLElBQUksSUFBSSxVQUFVO0FBRTlELE1BQUk7QUFDSixNQUFJLGNBQWMsYUFBYTtBQUM3QixlQUFXO0FBQUEsRUFDYixXQUFXLGNBQWMsV0FBVztBQUNsQyxlQUFXO0FBQUEsRUFDYixXQUFXLGNBQWMsZ0JBQWdCO0FBQ3ZDLGVBQVc7QUFBQSxFQUNiO0FBRUEsU0FBTyx1QkFBdUI7QUFBQSxJQUM1QixRQUFRO0FBQUEsSUFDUjtBQUFBLEVBQ0YsQ0FBQztBQUNIO0FBRU8sU0FBUyxTQUFTLEtBQWM7QUFDckMsVUFBUSxJQUFJLHVCQUF1QixHQUFHO0FBQ3RDLFFBQU0sRUFBRSxJQUFJLElBQUksSUFBSTtBQUNwQixRQUFNLEVBQUUsT0FBTyxPQUFPLElBQUk7QUFFMUIsTUFBSSxDQUFDLFFBQVEsVUFBVSxPQUFPLFdBQVcsS0FBSztBQUM1QyxJQUFBQyxNQUFLLGFBQWE7QUFBQSxFQUNwQjtBQUVBLE1BQUksT0FBTztBQUNULFdBQU9BLE1BQUssWUFBWSxNQUFNLFNBQVMsTUFBTSxNQUFNLE1BQU07QUFBQSxFQUMzRDtBQUVBLFNBQU8sSUFBSTtBQUNiOyIsCiAgIm5hbWVzIjogWyJ1dGlsIiwgInV0aWwiXQp9Cg==
