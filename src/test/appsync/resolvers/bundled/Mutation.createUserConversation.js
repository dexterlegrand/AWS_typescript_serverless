// apps/backend/src/appsync/resolvers/Mutation.createUserConversation.ts
import { util as util2 } from "@aws-appsync/utils";

// apps/backend/src/appsync/helpers/dynamodb.ts
import {
  util
} from "@aws-appsync/utils";
var dynamodbPutRequest = ({
  key,
  data,
  condition: inCondObj = {}
}) => {
  const condition = JSON.parse(
    util.transform.toDynamoDBConditionExpression(inCondObj)
  );
  if (condition.expressionValues && !Object.keys(condition.expressionValues).length) {
    delete condition.expressionValues;
  }
  return {
    operation: "PutItem",
    key: util.dynamodb.toMapValues(key),
    attributeValues: util.dynamodb.toMapValues(data),
    condition
  };
};

// apps/backend/src/appsync/resolvers/Mutation.createUserConversation.ts
function request(ctx) {
  console.log("CTX create user conversation: ", ctx);
  const { input } = ctx.arguments;
  const key = { id: util2.autoId() };
  const createdAt = util2.time.nowISO8601();
  const data = {
    ...input,
    createdAt,
    updatedAt: createdAt
  };
  const condition = { id: { attributeExists: false } };
  return dynamodbPutRequest({ key, data, condition });
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvTXV0YXRpb24uY3JlYXRlVXNlckNvbnZlcnNhdGlvbi50cyIsICIuLi8uLi8uLi8uLi9hcHBzeW5jL2hlbHBlcnMvZHluYW1vZGIudHMiXSwKICAibWFwcGluZ3MiOiAiO0FBQUEsU0FBMEMsUUFBQUEsYUFBWTs7O0FDQXREO0FBQUEsRUFXRTtBQUFBLE9BQ0s7QUE2Q0EsSUFBTSxxQkFBcUIsQ0FBQztBQUFBLEVBQ2pDO0FBQUEsRUFDQTtBQUFBLEVBQ0EsV0FBVyxZQUFZLENBQUM7QUFDMUIsTUFBdUQ7QUFDckQsUUFBTSxZQUFZLEtBQUs7QUFBQSxJQUNyQixLQUFLLFVBQVUsOEJBQThCLFNBQVM7QUFBQSxFQUN4RDtBQUNBLE1BQ0UsVUFBVSxvQkFDVixDQUFDLE9BQU8sS0FBSyxVQUFVLGdCQUFnQixFQUFFLFFBQ3pDO0FBQ0EsV0FBTyxVQUFVO0FBQUEsRUFDbkI7QUFDQSxTQUFPO0FBQUEsSUFDTCxXQUFXO0FBQUEsSUFDWCxLQUFLLEtBQUssU0FBUyxZQUFZLEdBQUc7QUFBQSxJQUNsQyxpQkFBaUIsS0FBSyxTQUFTLFlBQVksSUFBSTtBQUFBLElBQy9DO0FBQUEsRUFDRjtBQUNGOzs7QUQxRU8sU0FBUyxRQUFRLEtBQXNDO0FBQzVELFVBQVEsSUFBSSxrQ0FBa0MsR0FBRztBQUNqRCxRQUFNLEVBQUUsTUFBTSxJQUFJLElBQUk7QUFFdEIsUUFBTSxNQUFNLEVBQUUsSUFBSUMsTUFBSyxPQUFPLEVBQUU7QUFDaEMsUUFBTSxZQUFZQSxNQUFLLEtBQUssV0FBVztBQUN2QyxRQUFNLE9BQU87QUFBQSxJQUNYLEdBQUc7QUFBQSxJQUNIO0FBQUEsSUFDQSxXQUFXO0FBQUEsRUFDYjtBQUNBLFFBQU0sWUFBWSxFQUFFLElBQUksRUFBRSxpQkFBaUIsTUFBTSxFQUFFO0FBQ25ELFNBQU8sbUJBQW1CLEVBQUUsS0FBSyxNQUFNLFVBQVUsQ0FBQztBQUNwRDtBQUVPLFNBQVMsU0FBUyxLQUFjO0FBQ3JDLFFBQU0sRUFBRSxPQUFPLE9BQU8sSUFBSTtBQUMxQixNQUFJLE9BQU87QUFDVCxXQUFPQSxNQUFLLFlBQVksTUFBTSxTQUFTLE1BQU0sTUFBTSxNQUFNO0FBQUEsRUFDM0Q7QUFDQSxTQUFPLElBQUk7QUFDYjsiLAogICJuYW1lcyI6IFsidXRpbCIsICJ1dGlsIl0KfQo=
