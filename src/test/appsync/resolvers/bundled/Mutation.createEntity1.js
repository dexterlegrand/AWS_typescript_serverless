// apps/backend/src/appsync/resolvers/Mutation.createEntity1.ts
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

// apps/backend/src/appsync/resolvers/Mutation.createEntity1.ts
function request(ctx) {
  console.log("createEntity1 ctx: ", ctx);
  const {
    sub,
    claims: { given_name, family_name }
  } = ctx.identity;
  const key = { userId: sub, entityId: ctx?.prev?.result?.id };
  const createdAt = util2.time.nowISO8601();
  ctx.stash.entity = ctx?.prev?.result;
  const data = {
    id: util2.autoId(),
    owner: sub,
    entityId: ctx?.prev?.result?.id,
    entitySearchName: ctx?.prev?.result?.name.toLowerCase() ?? "",
    searchName: `${given_name} ${family_name}`.toLowerCase() ?? "",
    role: "OWNER",
    userId: sub,
    createdBy: sub,
    createdAt,
    updatedAt: createdAt
  };
  const condition = { id: { attributeExists: false } };
  return dynamodbPutRequest({ key, data, condition });
}
function response(ctx) {
  console.log("CTX RESPONSE (need to return entity): ", ctx);
  const { error, result } = ctx;
  if (error) {
    return util2.appendError(error.message, error.type, result);
  }
  return ctx?.prev?.result;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvTXV0YXRpb24uY3JlYXRlRW50aXR5MS50cyIsICIuLi8uLi8uLi8uLi9hcHBzeW5jL2hlbHBlcnMvZHluYW1vZGIudHMiXSwKICAibWFwcGluZ3MiOiAiO0FBQUE7QUFBQSxFQUlFLFFBQUFBO0FBQUEsT0FDSzs7O0FDTFA7QUFBQSxFQVdFO0FBQUEsT0FDSztBQTZDQSxJQUFNLHFCQUFxQixDQUFDO0FBQUEsRUFDakM7QUFBQSxFQUNBO0FBQUEsRUFDQSxXQUFXLFlBQVksQ0FBQztBQUMxQixNQUF1RDtBQUNyRCxRQUFNLFlBQVksS0FBSztBQUFBLElBQ3JCLEtBQUssVUFBVSw4QkFBOEIsU0FBUztBQUFBLEVBQ3hEO0FBQ0EsTUFDRSxVQUFVLG9CQUNWLENBQUMsT0FBTyxLQUFLLFVBQVUsZ0JBQWdCLEVBQUUsUUFDekM7QUFDQSxXQUFPLFVBQVU7QUFBQSxFQUNuQjtBQUNBLFNBQU87QUFBQSxJQUNMLFdBQVc7QUFBQSxJQUNYLEtBQUssS0FBSyxTQUFTLFlBQVksR0FBRztBQUFBLElBQ2xDLGlCQUFpQixLQUFLLFNBQVMsWUFBWSxJQUFJO0FBQUEsSUFDL0M7QUFBQSxFQUNGO0FBQ0Y7OztBRHBFTyxTQUFTLFFBQVEsS0FBc0M7QUFDNUQsVUFBUSxJQUFJLHVCQUF1QixHQUFHO0FBQ3RDLFFBQU07QUFBQSxJQUNKO0FBQUEsSUFDQSxRQUFRLEVBQUUsWUFBWSxZQUFZO0FBQUEsRUFDcEMsSUFBSSxJQUFJO0FBQ1IsUUFBTSxNQUFNLEVBQUUsUUFBUSxLQUFLLFVBQVUsS0FBSyxNQUFNLFFBQVEsR0FBRztBQUMzRCxRQUFNLFlBQVlDLE1BQUssS0FBSyxXQUFXO0FBQ3ZDLE1BQUksTUFBTSxTQUFTLEtBQUssTUFBTTtBQUU5QixRQUFNLE9BQU87QUFBQSxJQUNYLElBQUlBLE1BQUssT0FBTztBQUFBLElBQ2hCLE9BQU87QUFBQSxJQUNQLFVBQVUsS0FBSyxNQUFNLFFBQVE7QUFBQSxJQUM3QixrQkFBa0IsS0FBSyxNQUFNLFFBQVEsS0FBSyxZQUFZLEtBQUs7QUFBQSxJQUMzRCxZQUFZLEdBQUcsY0FBYyxjQUFjLFlBQVksS0FBSztBQUFBLElBQzVELE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYO0FBQUEsSUFDQSxXQUFXO0FBQUEsRUFDYjtBQUNBLFFBQU0sWUFBWSxFQUFFLElBQUksRUFBRSxpQkFBaUIsTUFBTSxFQUFFO0FBQ25ELFNBQU8sbUJBQW1CLEVBQUUsS0FBSyxNQUFNLFVBQVUsQ0FBQztBQUNwRDtBQUVPLFNBQVMsU0FBUyxLQUFjO0FBQ3JDLFVBQVEsSUFBSSwwQ0FBMEMsR0FBRztBQUN6RCxRQUFNLEVBQUUsT0FBTyxPQUFPLElBQUk7QUFDMUIsTUFBSSxPQUFPO0FBQ1QsV0FBT0EsTUFBSyxZQUFZLE1BQU0sU0FBUyxNQUFNLE1BQU0sTUFBTTtBQUFBLEVBQzNEO0FBQ0EsU0FBTyxLQUFLLE1BQU07QUFDcEI7IiwKICAibmFtZXMiOiBbInV0aWwiLCAidXRpbCJdCn0K
