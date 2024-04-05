// apps/backend/src/appsync/resolvers/Mutation.updateTask.ts
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

// apps/backend/src/appsync/resolvers/Mutation.updateTask.ts
function request(ctx) {
  const { sub, groups } = ctx.identity;
  const {
    input: { id, ...values }
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
    ...values,
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvTXV0YXRpb24udXBkYXRlVGFzay50cyIsICIuLi8uLi8uLi8uLi9hcHBzeW5jL2hlbHBlcnMvY29nbml0by50cyIsICIuLi8uLi8uLi8uLi9hcHBzeW5jL2hlbHBlcnMvZHluYW1vZGIudHMiXSwKICAibWFwcGluZ3MiOiAiO0FBQUE7QUFBQSxFQUlFLFFBQUFBO0FBQUEsT0FDSzs7O0FDTFAsU0FBUyxZQUFpQztBQUNuQyxJQUFNLGNBQWM7QUFBQSxFQUN6QixjQUFjO0FBQUEsRUFDZCxRQUFRO0FBQUEsRUFDUixPQUFPO0FBQ1Q7QUFTTyxJQUFNLFVBQVUsQ0FBQyxXQUE0QjtBQUNsRCxTQUNFLFFBQVEsU0FBUyxZQUFZLFlBQVksS0FDekMsUUFBUSxTQUFTLFlBQVksTUFBTTtBQUV2Qzs7O0FDbkJBO0FBQUEsRUFXRSxRQUFBQztBQUFBLE9BQ0s7QUFnSEEsSUFBTSx3QkFBd0IsQ0FBQztBQUFBLEVBQ3BDO0FBQUEsRUFDQTtBQUFBLEVBQ0EsV0FBVztBQUNiLE1BQTZEO0FBQzNELFFBQU0sT0FBTyxDQUFDO0FBQ2QsUUFBTSxVQUFVLENBQUM7QUFDakIsUUFBTSxrQkFBOEMsQ0FBQztBQUNyRCxRQUFNLFlBQXlDLENBQUM7QUFFaEQsYUFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLE9BQU8sUUFBUSxJQUFJLEdBQUc7QUFDekMsb0JBQWdCLElBQUksR0FBRyxJQUFJO0FBQzNCLFFBQUksR0FBRztBQUNMLFdBQUssS0FBSyxJQUFJLFFBQVEsR0FBRztBQUN6QixnQkFBVSxJQUFJLEdBQUcsSUFBSTtBQUFBLElBQ3ZCLE9BQU87QUFDTCxjQUFRLEtBQUssSUFBSSxHQUFHO0FBQUEsSUFDdEI7QUFBQSxFQUNGO0FBRUEsTUFBSSxhQUFhLEtBQUssU0FBUyxPQUFPLEtBQUssS0FBSyxJQUFJLE1BQU07QUFDMUQsZ0JBQWMsUUFBUSxTQUFTLFdBQVcsUUFBUSxLQUFLLElBQUksTUFBTTtBQUVqRSxRQUFNLFlBQVksWUFDZCxLQUFLLE1BQU1DLE1BQUssVUFBVSw4QkFBOEIsU0FBUyxDQUFDLElBQ2xFLENBQUM7QUFDTCxNQUNFLFVBQVUsb0JBQ1YsQ0FBQyxPQUFPLEtBQUssVUFBVSxnQkFBZ0IsRUFBRSxRQUN6QztBQUNBLFdBQU8sVUFBVTtBQUFBLEVBQ25CO0FBRUEsU0FBTztBQUFBLElBQ0wsV0FBVztBQUFBLElBQ1gsS0FBS0EsTUFBSyxTQUFTLFlBQVksR0FBRztBQUFBLElBQ2xDO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTjtBQUFBLE1BQ0E7QUFBQSxNQUNBLGtCQUFrQkEsTUFBSyxTQUFTLFlBQVksU0FBUztBQUFBLElBQ3ZEO0FBQUEsRUFDRjtBQUNGOzs7QUY5Sk8sU0FBUyxRQUFRLEtBQXlDO0FBQy9ELFFBQU0sRUFBRSxLQUFLLE9BQU8sSUFBSSxJQUFJO0FBQzVCLFFBQU07QUFBQSxJQUNKLE9BQU8sRUFBRSxJQUFJLEdBQUcsT0FBTztBQUFBLEVBQ3pCLElBQUksSUFBSTtBQUNSLFFBQU0sTUFBTSxFQUFFLEdBQUc7QUFFakIsTUFBSTtBQUNKLE1BQUlDLE1BQUssU0FBUyxNQUFNLHVCQUF1QixDQUFDLFFBQVEsTUFBTSxHQUFHO0FBQy9ELGdCQUFZO0FBQUEsTUFDVixJQUFJLEVBQUUsaUJBQWlCLEtBQUs7QUFBQSxNQUM1QixPQUFPLEVBQUUsSUFBSSxJQUFJO0FBQUEsSUFDbkI7QUFBQSxFQUNGO0FBRUEsUUFBTSxPQUFPO0FBQUEsSUFDWCxHQUFHO0FBQUEsSUFDSCxXQUFXQSxNQUFLLEtBQUssV0FBVztBQUFBLEVBQ2xDO0FBQ0EsU0FBTyxzQkFBc0IsRUFBRSxLQUFLLE1BQU0sVUFBVSxDQUFDO0FBQ3ZEO0FBRU8sU0FBUyxTQUFTLEtBQWM7QUFDckMsUUFBTSxFQUFFLE9BQU8sT0FBTyxJQUFJO0FBQzFCLE1BQUksT0FBTztBQUNULFdBQU9BLE1BQUssWUFBWSxNQUFNLFNBQVMsTUFBTSxNQUFNLE1BQU07QUFBQSxFQUMzRDtBQUNBLFNBQU87QUFDVDsiLAogICJuYW1lcyI6IFsidXRpbCIsICJ1dGlsIiwgInV0aWwiLCAidXRpbCJdCn0K
