// apps/backend/src/appsync/resolvers/Mutation.updateRating.ts
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
var dynamodbUpdateRequest = ({
  key,
  data,
  condition: inCondObj
}) => {
  const sets = [];
  const removes = [];
  const expressionNames = {};
  const expValues = {};
  for (const [k, v] of Object.entries(data)) {
    expressionNames[`#${k}`] = k;
    if (v) {
      sets.push(`#${k} = :${k}`);
      expValues[`:${k}`] = v;
    } else {
      removes.push(`#${k}`);
    }
  }
  let expression = sets.length ? `SET ${sets.join(", ")}` : "";
  expression += removes.length ? ` REMOVE ${removes.join(", ")}` : "";
  const condition = inCondObj ? JSON.parse(util2.transform.toDynamoDBConditionExpression(inCondObj)) : {};
  if (condition.expressionValues && !Object.keys(condition.expressionValues).length) {
    delete condition.expressionValues;
  }
  return {
    operation: "UpdateItem",
    key: util2.dynamodb.toMapValues(key),
    condition,
    update: {
      expression,
      expressionNames,
      expressionValues: util2.dynamodb.toMapValues(expValues)
    }
  };
};

// apps/backend/src/appsync/resolvers/Mutation.updateRating.ts
function request(ctx) {
  const { sub, groups } = ctx.identity;
  const {
    input: { id, ...input }
  } = ctx.args;
  const key = { id };
  let condition;
  if (util3.authType() !== "IAM Authorization" && !isAdmin(groups)) {
    condition = {
      id: { attributeExists: true },
      owner: { eq: sub }
    };
  }
  const data = {
    ...input,
    updatedAt: util3.time.nowISO8601()
  };
  return dynamodbUpdateRequest({ key, data, condition });
}
function response(ctx) {
  const { error, result } = ctx;
  if (error) {
    return util3.appendError(error.message, error.type, result);
  }
  return result;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvTXV0YXRpb24udXBkYXRlUmF0aW5nLnRzIiwgIi4uLy4uLy4uLy4uL2FwcHN5bmMvaGVscGVycy9jb2duaXRvLnRzIiwgIi4uLy4uLy4uLy4uL2FwcHN5bmMvaGVscGVycy9keW5hbW9kYi50cyJdLAogICJtYXBwaW5ncyI6ICI7QUFBQTtBQUFBLEVBSUUsUUFBQUE7QUFBQSxPQUNLOzs7QUNMUCxTQUFTLFlBQWlDO0FBQ25DLElBQU0sY0FBYztBQUFBLEVBQ3pCLGNBQWM7QUFBQSxFQUNkLFFBQVE7QUFBQSxFQUNSLE9BQU87QUFDVDtBQVNPLElBQU0sVUFBVSxDQUFDLFdBQTRCO0FBQ2xELFNBQ0UsUUFBUSxTQUFTLFlBQVksWUFBWSxLQUN6QyxRQUFRLFNBQVMsWUFBWSxNQUFNO0FBRXZDOzs7QUNuQkE7QUFBQSxFQVdFLFFBQUFDO0FBQUEsT0FDSztBQWdIQSxJQUFNLHdCQUF3QixDQUFDO0FBQUEsRUFDcEM7QUFBQSxFQUNBO0FBQUEsRUFDQSxXQUFXO0FBQ2IsTUFBNkQ7QUFDM0QsUUFBTSxPQUFPLENBQUM7QUFDZCxRQUFNLFVBQVUsQ0FBQztBQUNqQixRQUFNLGtCQUE4QyxDQUFDO0FBQ3JELFFBQU0sWUFBeUMsQ0FBQztBQUVoRCxhQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssT0FBTyxRQUFRLElBQUksR0FBRztBQUN6QyxvQkFBZ0IsSUFBSSxHQUFHLElBQUk7QUFDM0IsUUFBSSxHQUFHO0FBQ0wsV0FBSyxLQUFLLElBQUksUUFBUSxHQUFHO0FBQ3pCLGdCQUFVLElBQUksR0FBRyxJQUFJO0FBQUEsSUFDdkIsT0FBTztBQUNMLGNBQVEsS0FBSyxJQUFJLEdBQUc7QUFBQSxJQUN0QjtBQUFBLEVBQ0Y7QUFFQSxNQUFJLGFBQWEsS0FBSyxTQUFTLE9BQU8sS0FBSyxLQUFLLElBQUksTUFBTTtBQUMxRCxnQkFBYyxRQUFRLFNBQVMsV0FBVyxRQUFRLEtBQUssSUFBSSxNQUFNO0FBRWpFLFFBQU0sWUFBWSxZQUNkLEtBQUssTUFBTUMsTUFBSyxVQUFVLDhCQUE4QixTQUFTLENBQUMsSUFDbEUsQ0FBQztBQUNMLE1BQ0UsVUFBVSxvQkFDVixDQUFDLE9BQU8sS0FBSyxVQUFVLGdCQUFnQixFQUFFLFFBQ3pDO0FBQ0EsV0FBTyxVQUFVO0FBQUEsRUFDbkI7QUFFQSxTQUFPO0FBQUEsSUFDTCxXQUFXO0FBQUEsSUFDWCxLQUFLQSxNQUFLLFNBQVMsWUFBWSxHQUFHO0FBQUEsSUFDbEM7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOO0FBQUEsTUFDQTtBQUFBLE1BQ0Esa0JBQWtCQSxNQUFLLFNBQVMsWUFBWSxTQUFTO0FBQUEsSUFDdkQ7QUFBQSxFQUNGO0FBQ0Y7OztBRjlKTyxTQUFTLFFBQVEsS0FBeUM7QUFDL0QsUUFBTSxFQUFFLEtBQUssT0FBTyxJQUFJLElBQUk7QUFDNUIsUUFBTTtBQUFBLElBQ0osT0FBTyxFQUFFLElBQUksR0FBRyxNQUFNO0FBQUEsRUFDeEIsSUFBSSxJQUFJO0FBQ1IsUUFBTSxNQUFNLEVBQUUsR0FBRztBQUVqQixNQUFJO0FBQ0osTUFBSUMsTUFBSyxTQUFTLE1BQU0sdUJBQXVCLENBQUMsUUFBUSxNQUFNLEdBQUc7QUFDL0QsZ0JBQVk7QUFBQSxNQUNWLElBQUksRUFBRSxpQkFBaUIsS0FBSztBQUFBLE1BQzVCLE9BQU8sRUFBRSxJQUFJLElBQUk7QUFBQSxJQUNuQjtBQUFBLEVBQ0Y7QUFFQSxRQUFNLE9BQU87QUFBQSxJQUNYLEdBQUc7QUFBQSxJQUNILFdBQVdBLE1BQUssS0FBSyxXQUFXO0FBQUEsRUFDbEM7QUFDQSxTQUFPLHNCQUFzQixFQUFFLEtBQUssTUFBTSxVQUFVLENBQUM7QUFDdkQ7QUFFTyxTQUFTLFNBQVMsS0FBYztBQUNyQyxRQUFNLEVBQUUsT0FBTyxPQUFPLElBQUk7QUFDMUIsTUFBSSxPQUFPO0FBQ1QsV0FBT0EsTUFBSyxZQUFZLE1BQU0sU0FBUyxNQUFNLE1BQU0sTUFBTTtBQUFBLEVBQzNEO0FBQ0EsU0FBTztBQUNUOyIsCiAgIm5hbWVzIjogWyJ1dGlsIiwgInV0aWwiLCAidXRpbCIsICJ1dGlsIl0KfQo=
