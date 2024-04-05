// apps/backend/src/appsync/resolvers/Mutation.createNotification.ts
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

// apps/backend/src/appsync/resolvers/Mutation.createNotification.ts
function request(ctx) {
  console.log("Mutation.createNotification ctx: ", ctx);
  const { input } = ctx.arguments;
  if (util2.authType() !== "IAM Authorization") {
    util2.unauthorized();
  }
  const key = { id: util2.autoId() };
  const createdAt = util2.time.nowISO8601();
  const data = {
    ...input,
    status: "UNREAD",
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvTXV0YXRpb24uY3JlYXRlTm90aWZpY2F0aW9uLnRzIiwgIi4uLy4uLy4uLy4uL2FwcHN5bmMvaGVscGVycy9keW5hbW9kYi50cyJdLAogICJtYXBwaW5ncyI6ICI7QUFBQSxTQUEwQyxRQUFBQSxhQUFZOzs7QUNBdEQ7QUFBQSxFQVdFO0FBQUEsT0FDSztBQTZDQSxJQUFNLHFCQUFxQixDQUFDO0FBQUEsRUFDakM7QUFBQSxFQUNBO0FBQUEsRUFDQSxXQUFXLFlBQVksQ0FBQztBQUMxQixNQUF1RDtBQUNyRCxRQUFNLFlBQVksS0FBSztBQUFBLElBQ3JCLEtBQUssVUFBVSw4QkFBOEIsU0FBUztBQUFBLEVBQ3hEO0FBQ0EsTUFDRSxVQUFVLG9CQUNWLENBQUMsT0FBTyxLQUFLLFVBQVUsZ0JBQWdCLEVBQUUsUUFDekM7QUFDQSxXQUFPLFVBQVU7QUFBQSxFQUNuQjtBQUNBLFNBQU87QUFBQSxJQUNMLFdBQVc7QUFBQSxJQUNYLEtBQUssS0FBSyxTQUFTLFlBQVksR0FBRztBQUFBLElBQ2xDLGlCQUFpQixLQUFLLFNBQVMsWUFBWSxJQUFJO0FBQUEsSUFDL0M7QUFBQSxFQUNGO0FBQ0Y7OztBRDFFTyxTQUFTLFFBQVEsS0FBc0M7QUFDNUQsVUFBUSxJQUFJLHFDQUFxQyxHQUFHO0FBQ3BELFFBQU0sRUFBRSxNQUFNLElBQUksSUFBSTtBQUV0QixNQUFJQyxNQUFLLFNBQVMsTUFBTSxxQkFBcUI7QUFDM0MsSUFBQUEsTUFBSyxhQUFhO0FBQUEsRUFDcEI7QUFFQSxRQUFNLE1BQU0sRUFBRSxJQUFJQSxNQUFLLE9BQU8sRUFBRTtBQUNoQyxRQUFNLFlBQVlBLE1BQUssS0FBSyxXQUFXO0FBQ3ZDLFFBQU0sT0FBTztBQUFBLElBQ1gsR0FBRztBQUFBLElBQ0gsUUFBUTtBQUFBLElBQ1I7QUFBQSxJQUNBLFdBQVc7QUFBQSxFQUNiO0FBQ0EsUUFBTSxZQUFZLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixNQUFNLEVBQUU7QUFDbkQsU0FBTyxtQkFBbUIsRUFBRSxLQUFLLE1BQU0sVUFBVSxDQUFDO0FBQ3BEO0FBRU8sU0FBUyxTQUFTLEtBQWM7QUFDckMsUUFBTSxFQUFFLE9BQU8sT0FBTyxJQUFJO0FBQzFCLE1BQUksT0FBTztBQUNULFdBQU9BLE1BQUssWUFBWSxNQUFNLFNBQVMsTUFBTSxNQUFNLE1BQU07QUFBQSxFQUMzRDtBQUNBLFNBQU8sSUFBSTtBQUNiOyIsCiAgIm5hbWVzIjogWyJ1dGlsIiwgInV0aWwiXQp9Cg==
