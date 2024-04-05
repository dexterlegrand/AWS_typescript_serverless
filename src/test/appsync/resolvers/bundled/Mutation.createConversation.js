// apps/backend/src/appsync/resolvers/Mutation.createConversation.ts
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

// apps/backend/src/appsync/resolvers/Mutation.createConversation.ts
function request(ctx) {
  console.log("CTX create conversation: ", ctx);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvTXV0YXRpb24uY3JlYXRlQ29udmVyc2F0aW9uLnRzIiwgIi4uLy4uLy4uLy4uL2FwcHN5bmMvaGVscGVycy9keW5hbW9kYi50cyJdLAogICJtYXBwaW5ncyI6ICI7QUFBQSxTQUEwQyxRQUFBQSxhQUFZOzs7QUNBdEQ7QUFBQSxFQVdFO0FBQUEsT0FDSztBQTZDQSxJQUFNLHFCQUFxQixDQUFDO0FBQUEsRUFDakM7QUFBQSxFQUNBO0FBQUEsRUFDQSxXQUFXLFlBQVksQ0FBQztBQUMxQixNQUF1RDtBQUNyRCxRQUFNLFlBQVksS0FBSztBQUFBLElBQ3JCLEtBQUssVUFBVSw4QkFBOEIsU0FBUztBQUFBLEVBQ3hEO0FBQ0EsTUFDRSxVQUFVLG9CQUNWLENBQUMsT0FBTyxLQUFLLFVBQVUsZ0JBQWdCLEVBQUUsUUFDekM7QUFDQSxXQUFPLFVBQVU7QUFBQSxFQUNuQjtBQUNBLFNBQU87QUFBQSxJQUNMLFdBQVc7QUFBQSxJQUNYLEtBQUssS0FBSyxTQUFTLFlBQVksR0FBRztBQUFBLElBQ2xDLGlCQUFpQixLQUFLLFNBQVMsWUFBWSxJQUFJO0FBQUEsSUFDL0M7QUFBQSxFQUNGO0FBQ0Y7OztBRDFFTyxTQUFTLFFBQVEsS0FBc0M7QUFDNUQsVUFBUSxJQUFJLDZCQUE2QixHQUFHO0FBQzVDLFFBQU0sRUFBRSxNQUFNLElBQUksSUFBSTtBQUV0QixRQUFNLE1BQU0sRUFBRSxJQUFJQyxNQUFLLE9BQU8sRUFBRTtBQUNoQyxRQUFNLFlBQVlBLE1BQUssS0FBSyxXQUFXO0FBQ3ZDLFFBQU0sT0FBTztBQUFBLElBQ1gsR0FBRztBQUFBLElBQ0g7QUFBQSxJQUNBLFdBQVc7QUFBQSxFQUNiO0FBQ0EsUUFBTSxZQUFZLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixNQUFNLEVBQUU7QUFDbkQsU0FBTyxtQkFBbUIsRUFBRSxLQUFLLE1BQU0sVUFBVSxDQUFDO0FBQ3BEO0FBRU8sU0FBUyxTQUFTLEtBQWM7QUFDckMsUUFBTSxFQUFFLE9BQU8sT0FBTyxJQUFJO0FBQzFCLE1BQUksT0FBTztBQUNULFdBQU9BLE1BQUssWUFBWSxNQUFNLFNBQVMsTUFBTSxNQUFNLE1BQU07QUFBQSxFQUMzRDtBQUNBLFNBQU8sSUFBSTtBQUNiOyIsCiAgIm5hbWVzIjogWyJ1dGlsIiwgInV0aWwiXQp9Cg==
