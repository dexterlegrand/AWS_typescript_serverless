// apps/backend/src/appsync/resolvers/Mutation.deleteProduct.ts
import {
  util as util3
} from "@aws-appsync/utils";

// apps/backend/src/appsync/helpers/cognito.ts
import { util } from "@aws-appsync/utils";
var USER_GROUPS = {
  SUPER_ADMINS: "SuperAdmins",
  ADMINS: "Admins",
  USERS: "Users"
};
var isAdmin = (groups) => {
  return groups?.includes(USER_GROUPS.SUPER_ADMINS) || groups?.includes(USER_GROUPS.ADMINS);
};

// apps/backend/src/appsync/helpers/dynamodb.ts
import {
  util as util2
} from "@aws-appsync/utils";
var dynamodbDeleteRequest = ({
  key,
  condition: inCondObj = {}
}) => {
  const condition = JSON.parse(
    util2.transform.toDynamoDBConditionExpression(inCondObj)
  );
  if (condition.expressionValues && !Object.keys(condition.expressionValues).length) {
    delete condition.expressionValues;
  }
  if (condition) {
    return {
      operation: "DeleteItem",
      key: util2.dynamodb.toMapValues(key),
      condition
    };
  }
  return {
    operation: "DeleteItem",
    key: util2.dynamodb.toMapValues(key)
  };
};

// apps/backend/src/appsync/resolvers/Mutation.deleteProduct.ts
function request(ctx) {
  const { sub, groups } = ctx.identity;
  const {
    arguments: {
      input: { id }
    }
  } = ctx;
  let condition = {};
  const key = { id };
  if (util3.authType() !== "IAM Authorization" && !isAdmin(groups)) {
    condition = {
      owner: { eq: sub }
    };
  }
  return dynamodbDeleteRequest({ key, condition });
}
function response(ctx) {
  const { error, result } = ctx;
  if (error) {
    return util3.appendError(error.message, error.type, result);
  }
  return ctx.result;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvTXV0YXRpb24uZGVsZXRlUHJvZHVjdC50cyIsICIuLi8uLi8uLi8uLi9hcHBzeW5jL2hlbHBlcnMvY29nbml0by50cyIsICIuLi8uLi8uLi8uLi9hcHBzeW5jL2hlbHBlcnMvZHluYW1vZGIudHMiXSwKICAibWFwcGluZ3MiOiAiO0FBQUE7QUFBQSxFQUVFLFFBQUFBO0FBQUEsT0FJSzs7O0FDTlAsU0FBUyxZQUFpQztBQUNuQyxJQUFNLGNBQWM7QUFBQSxFQUN6QixjQUFjO0FBQUEsRUFDZCxRQUFRO0FBQUEsRUFDUixPQUFPO0FBQ1Q7QUFTTyxJQUFNLFVBQVUsQ0FBQyxXQUE0QjtBQUNsRCxTQUNFLFFBQVEsU0FBUyxZQUFZLFlBQVksS0FDekMsUUFBUSxTQUFTLFlBQVksTUFBTTtBQUV2Qzs7O0FDbkJBO0FBQUEsRUFXRSxRQUFBQztBQUFBLE9BQ0s7QUFTQSxJQUFNLHdCQUF3QixDQUFDO0FBQUEsRUFDcEM7QUFBQSxFQUNBLFdBQVcsWUFBWSxDQUFDO0FBQzFCLE1BQXVDO0FBRXJDLFFBQU0sWUFBWSxLQUFLO0FBQUEsSUFDckJBLE1BQUssVUFBVSw4QkFBOEIsU0FBUztBQUFBLEVBQ3hEO0FBQ0EsTUFDRSxVQUFVLG9CQUNWLENBQUMsT0FBTyxLQUFLLFVBQVUsZ0JBQWdCLEVBQUUsUUFDekM7QUFDQSxXQUFPLFVBQVU7QUFBQSxFQUNuQjtBQUVBLE1BQUksV0FBVztBQUNiLFdBQU87QUFBQSxNQUNMLFdBQVc7QUFBQSxNQUNYLEtBQUtBLE1BQUssU0FBUyxZQUFZLEdBQUc7QUFBQSxNQUNsQztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEsU0FBTztBQUFBLElBQ0wsV0FBVztBQUFBLElBQ1gsS0FBS0EsTUFBSyxTQUFTLFlBQVksR0FBRztBQUFBLEVBQ3BDO0FBQ0Y7OztBRnRDTyxTQUFTLFFBQVEsS0FBc0M7QUFDNUQsUUFBTSxFQUFFLEtBQUssT0FBTyxJQUFJLElBQUk7QUFDNUIsUUFBTTtBQUFBLElBQ0osV0FBVztBQUFBLE1BQ1QsT0FBTyxFQUFFLEdBQUc7QUFBQSxJQUNkO0FBQUEsRUFDRixJQUFJO0FBRUosTUFBSSxZQUFrQyxDQUFDO0FBQ3ZDLFFBQU0sTUFBTSxFQUFFLEdBQUc7QUFFakIsTUFBSUMsTUFBSyxTQUFTLE1BQU0sdUJBQXVCLENBQUMsUUFBUSxNQUFNLEdBQUc7QUFDL0QsZ0JBQVk7QUFBQSxNQUNWLE9BQU8sRUFBRSxJQUFJLElBQUk7QUFBQSxJQUNuQjtBQUFBLEVBQ0Y7QUFFQSxTQUFPLHNCQUFzQixFQUFFLEtBQUssVUFBVSxDQUFDO0FBQ2pEO0FBRU8sU0FBUyxTQUFTLEtBQWM7QUFDckMsUUFBTSxFQUFFLE9BQU8sT0FBTyxJQUFJO0FBQzFCLE1BQUksT0FBTztBQUNULFdBQU9BLE1BQUssWUFBWSxNQUFNLFNBQVMsTUFBTSxNQUFNLE1BQU07QUFBQSxFQUMzRDtBQUNBLFNBQU8sSUFBSTtBQUNiOyIsCiAgIm5hbWVzIjogWyJ1dGlsIiwgInV0aWwiLCAidXRpbCJdCn0K
