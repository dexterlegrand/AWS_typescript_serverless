// apps/backend/src/appsync/resolvers/Mutation.createEntity0.ts
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

// apps/backend/src/appsync/helpers/ocr.ts
var generate5DigitNumber = () => {
  const random = Math.random();
  return Math.floor(random * 9e4) + 1e4;
};
var generateEntityEmail = (name) => {
  const subdomainFriendly = name.split("").reduce((acc, char) => {
    const isAlphanumeric = char >= "a" && char <= "z" || char >= "A" && char <= "Z" || char >= "0" && char <= "9";
    return isAlphanumeric ? acc + char.toLowerCase() : acc;
  }, "");
  const uniqueString = generate5DigitNumber();
  return `${subdomainFriendly}_${uniqueString}@docs.admiin.com`;
};

// apps/backend/src/appsync/resolvers/Mutation.createEntity0.ts
function request(ctx) {
  console.log("CreateEntity0 ctx request: ", ctx);
  const {
    sub,
    claims: { phone_number }
  } = ctx.identity;
  const { input } = ctx.arguments;
  const key = { id: util2.autoId() };
  const createdAt = util2.time.nowISO8601();
  const ocrEmail = generateEntityEmail(input.name ?? "");
  console.log("ocrEmail: ", ocrEmail);
  const data = {
    ...input,
    owner: sub,
    searchName: input.name.toLowerCase() ?? "",
    paymentMethods: [],
    phone: phone_number,
    createdAt,
    updatedAt: createdAt
  };
  if (ocrEmail) {
    data.ocrEmail = ocrEmail;
  }
  const condition = { id: { attributeExists: false } };
  return dynamodbPutRequest({ key, data, condition });
}
function response(ctx) {
  console.log("CreateEntity0 ctx response: ", ctx);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvTXV0YXRpb24uY3JlYXRlRW50aXR5MC50cyIsICIuLi8uLi8uLi8uLi9hcHBzeW5jL2hlbHBlcnMvZHluYW1vZGIudHMiLCAiLi4vLi4vLi4vLi4vYXBwc3luYy9oZWxwZXJzL29jci50cyJdLAogICJtYXBwaW5ncyI6ICI7QUFBQTtBQUFBLEVBSUUsUUFBQUE7QUFBQSxPQUNLOzs7QUNMUDtBQUFBLEVBV0U7QUFBQSxPQUNLO0FBNkNBLElBQU0scUJBQXFCLENBQUM7QUFBQSxFQUNqQztBQUFBLEVBQ0E7QUFBQSxFQUNBLFdBQVcsWUFBWSxDQUFDO0FBQzFCLE1BQXVEO0FBQ3JELFFBQU0sWUFBWSxLQUFLO0FBQUEsSUFDckIsS0FBSyxVQUFVLDhCQUE4QixTQUFTO0FBQUEsRUFDeEQ7QUFDQSxNQUNFLFVBQVUsb0JBQ1YsQ0FBQyxPQUFPLEtBQUssVUFBVSxnQkFBZ0IsRUFBRSxRQUN6QztBQUNBLFdBQU8sVUFBVTtBQUFBLEVBQ25CO0FBQ0EsU0FBTztBQUFBLElBQ0wsV0FBVztBQUFBLElBQ1gsS0FBSyxLQUFLLFNBQVMsWUFBWSxHQUFHO0FBQUEsSUFDbEMsaUJBQWlCLEtBQUssU0FBUyxZQUFZLElBQUk7QUFBQSxJQUMvQztBQUFBLEVBQ0Y7QUFDRjs7O0FDN0VPLElBQU0sdUJBQXVCLE1BQU07QUFDeEMsUUFBTSxTQUFTLEtBQUssT0FBTztBQUMzQixTQUFPLEtBQUssTUFBTSxTQUFTLEdBQUssSUFBSTtBQUN0QztBQVFPLElBQU0sc0JBQXNCLENBQUMsU0FBaUI7QUFFbkQsUUFBTSxvQkFBb0IsS0FBSyxNQUFNLEVBQUUsRUFBRSxPQUFPLENBQUMsS0FBSyxTQUFTO0FBQzdELFVBQU0saUJBQ0gsUUFBUSxPQUFPLFFBQVEsT0FDdkIsUUFBUSxPQUFPLFFBQVEsT0FDdkIsUUFBUSxPQUFPLFFBQVE7QUFDMUIsV0FBTyxpQkFBaUIsTUFBTSxLQUFLLFlBQVksSUFBSTtBQUFBLEVBQ3JELEdBQUcsRUFBRTtBQUVMLFFBQU0sZUFBZSxxQkFBcUI7QUFDMUMsU0FBTyxHQUFHLHFCQUFxQjtBQUNqQzs7O0FGYk8sU0FBUyxRQUFRLEtBQXNDO0FBQzVELFVBQVEsSUFBSSwrQkFBK0IsR0FBRztBQUM5QyxRQUFNO0FBQUEsSUFDSjtBQUFBLElBQ0EsUUFBUSxFQUFFLGFBQWE7QUFBQSxFQUN6QixJQUFJLElBQUk7QUFDUixRQUFNLEVBQUUsTUFBTSxJQUFJLElBQUk7QUFFdEIsUUFBTSxNQUFNLEVBQUUsSUFBSUMsTUFBSyxPQUFPLEVBQUU7QUFDaEMsUUFBTSxZQUFZQSxNQUFLLEtBQUssV0FBVztBQUN2QyxRQUFNLFdBQVcsb0JBQW9CLE1BQU0sUUFBUSxFQUFFO0FBQ3JELFVBQVEsSUFBSSxjQUFjLFFBQVE7QUFDbEMsUUFBTSxPQUFPO0FBQUEsSUFDWCxHQUFHO0FBQUEsSUFDSCxPQUFPO0FBQUEsSUFDUCxZQUFZLE1BQU0sS0FBSyxZQUFZLEtBQUs7QUFBQSxJQUN4QyxnQkFBZ0IsQ0FBQztBQUFBLElBQ2pCLE9BQU87QUFBQSxJQUNQO0FBQUEsSUFDQSxXQUFXO0FBQUEsRUFDYjtBQUVBLE1BQUksVUFBVTtBQUNaLFNBQUssV0FBVztBQUFBLEVBQ2xCO0FBRUEsUUFBTSxZQUFZLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixNQUFNLEVBQUU7QUFDbkQsU0FBTyxtQkFBbUIsRUFBRSxLQUFLLE1BQU0sVUFBVSxDQUFDO0FBQ3BEO0FBRU8sU0FBUyxTQUFTLEtBQWM7QUFDckMsVUFBUSxJQUFJLGdDQUFnQyxHQUFHO0FBQy9DLFFBQU0sRUFBRSxPQUFPLE9BQU8sSUFBSTtBQUMxQixNQUFJLE9BQU87QUFDVCxXQUFPQSxNQUFLLFlBQVksTUFBTSxTQUFTLE1BQU0sTUFBTSxNQUFNO0FBQUEsRUFDM0Q7QUFDQSxTQUFPLElBQUk7QUFDYjsiLAogICJuYW1lcyI6IFsidXRpbCIsICJ1dGlsIl0KfQo=
