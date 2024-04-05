// apps/backend/src/appsync/resolvers/Conversation.product.ts
import {
  runtime,
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

// apps/backend/src/appsync/resolvers/Conversation.product.ts
function request(ctx) {
  const { productId } = ctx.source;
  console.log("Conversation.product.ctx: ", ctx);
  if (!productId) {
    runtime.earlyReturn();
  }
  return dynamoDBGetItemRequest({ id: productId });
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvQ29udmVyc2F0aW9uLnByb2R1Y3QudHMiLCAiLi4vLi4vLi4vLi4vYXBwc3luYy9oZWxwZXJzL2R5bmFtb2RiLnRzIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBO0FBQUEsRUFHRTtBQUFBLEVBQ0EsUUFBQUE7QUFBQSxPQUNLOzs7QUNMUDtBQUFBLEVBV0U7QUFBQSxPQUNLO0FBc0NBLElBQU0seUJBQXlCLENBQUMsUUFBcUM7QUFDMUUsU0FBTztBQUFBLElBQ0wsV0FBVztBQUFBLElBQ1gsS0FBSyxLQUFLLFNBQVMsWUFBWSxHQUFHO0FBQUEsRUFDcEM7QUFDRjs7O0FEL0NPLFNBQVMsUUFBUSxLQUFzQztBQUM1RCxRQUFNLEVBQUUsVUFBVSxJQUFJLElBQUk7QUFDMUIsVUFBUSxJQUFJLDhCQUE4QixHQUFHO0FBRTdDLE1BQUksQ0FBQyxXQUFXO0FBQ2QsWUFBUSxZQUFZO0FBQUEsRUFDdEI7QUFFQSxTQUFPLHVCQUF1QixFQUFFLElBQUksVUFBVSxDQUFDO0FBQ2pEO0FBRU8sU0FBUyxTQUFTLEtBQWM7QUFDckMsUUFBTSxFQUFFLE9BQU8sT0FBTyxJQUFJO0FBQzFCLE1BQUksT0FBTztBQUNULFdBQU9DLE1BQUssWUFBWSxNQUFNLFNBQVMsTUFBTSxNQUFNLE1BQU07QUFBQSxFQUMzRDtBQUNBLFNBQU8sSUFBSTtBQUNiOyIsCiAgIm5hbWVzIjogWyJ1dGlsIiwgInV0aWwiXQp9Cg==
