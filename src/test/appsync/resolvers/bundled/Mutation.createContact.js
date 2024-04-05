// apps/backend/src/appsync/resolvers/Mutation.createContact.ts
import {
  util as util2
} from "@aws-appsync/utils";

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

// apps/backend/src/appsync/resolvers/Mutation.createContact.ts
function request(ctx) {
  const { sub } = ctx.identity;
  const { input } = ctx.arguments;
  const key = { id: util2.autoId() };
  const createdAt = util2.time.nowISO8601();
  const data = {
    ...input,
    owner: sub,
    status: "ACTIVE" /* ACTIVE */,
    type: "NORMAL" /* NORMAL */,
    searchName: (input.companyName || `${input.firstName ?? ""} ${input.lastName ?? ""}`).toLowerCase(),
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvTXV0YXRpb24uY3JlYXRlQ29udGFjdC50cyIsICIuLi8uLi8uLi8uLi9hcHBzeW5jL2hlbHBlcnMvZHluYW1vZGIudHMiXSwKICAibWFwcGluZ3MiOiAiO0FBQUE7QUFBQSxFQUlFLFFBQUFBO0FBQUEsT0FDSzs7O0FDTFA7QUFBQSxFQVdFO0FBQUEsT0FDSztBQTZDQSxJQUFNLHFCQUFxQixDQUFDO0FBQUEsRUFDakM7QUFBQSxFQUNBO0FBQUEsRUFDQSxXQUFXLFlBQVksQ0FBQztBQUMxQixNQUF1RDtBQUNyRCxRQUFNLFlBQVksS0FBSztBQUFBLElBQ3JCLEtBQUssVUFBVSw4QkFBOEIsU0FBUztBQUFBLEVBQ3hEO0FBQ0EsTUFDRSxVQUFVLG9CQUNWLENBQUMsT0FBTyxLQUFLLFVBQVUsZ0JBQWdCLEVBQUUsUUFDekM7QUFDQSxXQUFPLFVBQVU7QUFBQSxFQUNuQjtBQUNBLFNBQU87QUFBQSxJQUNMLFdBQVc7QUFBQSxJQUNYLEtBQUssS0FBSyxTQUFTLFlBQVksR0FBRztBQUFBLElBQ2xDLGlCQUFpQixLQUFLLFNBQVMsWUFBWSxJQUFJO0FBQUEsSUFDL0M7QUFBQSxFQUNGO0FBQ0Y7OztBRHBFTyxTQUFTLFFBQVEsS0FBc0M7QUFDNUQsUUFBTSxFQUFFLElBQUksSUFBSSxJQUFJO0FBQ3BCLFFBQU0sRUFBRSxNQUFNLElBQUksSUFBSTtBQUV0QixRQUFNLE1BQU0sRUFBRSxJQUFJQyxNQUFLLE9BQU8sRUFBRTtBQUNoQyxRQUFNLFlBQVlBLE1BQUssS0FBSyxXQUFXO0FBQ3ZDLFFBQU0sT0FBTztBQUFBLElBQ1gsR0FBRztBQUFBLElBQ0gsT0FBTztBQUFBLElBQ1A7QUFBQSxJQUNBO0FBQUEsSUFDQSxhQUNFLE1BQU0sZUFBZSxHQUFHLE1BQU0sYUFBYSxNQUFNLE1BQU0sWUFBWSxNQUNuRSxZQUFZO0FBQUEsSUFDZDtBQUFBLElBQ0EsV0FBVztBQUFBLEVBQ2I7QUFDQSxRQUFNLFlBQVksRUFBRSxJQUFJLEVBQUUsaUJBQWlCLE1BQU0sRUFBRTtBQUNuRCxTQUFPLG1CQUFtQixFQUFFLEtBQUssTUFBTSxVQUFVLENBQUM7QUFDcEQ7QUFFTyxTQUFTLFNBQVMsS0FBYztBQUNyQyxRQUFNLEVBQUUsT0FBTyxPQUFPLElBQUk7QUFDMUIsTUFBSSxPQUFPO0FBQ1QsV0FBT0EsTUFBSyxZQUFZLE1BQU0sU0FBUyxNQUFNLE1BQU0sTUFBTTtBQUFBLEVBQzNEO0FBQ0EsU0FBTyxJQUFJO0FBQ2I7IiwKICAibmFtZXMiOiBbInV0aWwiLCAidXRpbCJdCn0K
