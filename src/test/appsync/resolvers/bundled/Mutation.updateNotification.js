// apps/backend/src/appsync/resolvers/Mutation.updateNotification.ts
import {
  util as util2
} from "@aws-appsync/utils";

// apps/backend/src/appsync/helpers/dynamodb.ts
import {
  util
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
  const condition = inCondObj ? JSON.parse(util.transform.toDynamoDBConditionExpression(inCondObj)) : {};
  if (condition.expressionValues && !Object.keys(condition.expressionValues).length) {
    delete condition.expressionValues;
  }
  return {
    operation: "UpdateItem",
    key: util.dynamodb.toMapValues(key),
    condition,
    update: {
      expression,
      expressionNames,
      expressionValues: util.dynamodb.toMapValues(expValues)
    }
  };
};

// apps/backend/src/appsync/resolvers/Mutation.updateNotification.ts
function request(ctx) {
  const { sub } = ctx.identity;
  const {
    input: { id, ...input }
  } = ctx.args;
  const key = { id };
  const condition = {
    id: { attributeExists: true },
    owner: { eq: sub }
  };
  const data = {
    ...input,
    updatedAt: util2.time.nowISO8601()
  };
  return dynamodbUpdateRequest({ key, data, condition });
}
function response(ctx) {
  const { error, result } = ctx;
  if (error) {
    return util2.appendError(error.message, error.type, result);
  }
  return result;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvTXV0YXRpb24udXBkYXRlTm90aWZpY2F0aW9uLnRzIiwgIi4uLy4uLy4uLy4uL2FwcHN5bmMvaGVscGVycy9keW5hbW9kYi50cyJdLAogICJtYXBwaW5ncyI6ICI7QUFBQTtBQUFBLEVBSUUsUUFBQUE7QUFBQSxPQUNLOzs7QUNMUDtBQUFBLEVBV0U7QUFBQSxPQUNLO0FBZ0hBLElBQU0sd0JBQXdCLENBQUM7QUFBQSxFQUNwQztBQUFBLEVBQ0E7QUFBQSxFQUNBLFdBQVc7QUFDYixNQUE2RDtBQUMzRCxRQUFNLE9BQU8sQ0FBQztBQUNkLFFBQU0sVUFBVSxDQUFDO0FBQ2pCLFFBQU0sa0JBQThDLENBQUM7QUFDckQsUUFBTSxZQUF5QyxDQUFDO0FBRWhELGFBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxPQUFPLFFBQVEsSUFBSSxHQUFHO0FBQ3pDLG9CQUFnQixJQUFJLEdBQUcsSUFBSTtBQUMzQixRQUFJLEdBQUc7QUFDTCxXQUFLLEtBQUssSUFBSSxRQUFRLEdBQUc7QUFDekIsZ0JBQVUsSUFBSSxHQUFHLElBQUk7QUFBQSxJQUN2QixPQUFPO0FBQ0wsY0FBUSxLQUFLLElBQUksR0FBRztBQUFBLElBQ3RCO0FBQUEsRUFDRjtBQUVBLE1BQUksYUFBYSxLQUFLLFNBQVMsT0FBTyxLQUFLLEtBQUssSUFBSSxNQUFNO0FBQzFELGdCQUFjLFFBQVEsU0FBUyxXQUFXLFFBQVEsS0FBSyxJQUFJLE1BQU07QUFFakUsUUFBTSxZQUFZLFlBQ2QsS0FBSyxNQUFNLEtBQUssVUFBVSw4QkFBOEIsU0FBUyxDQUFDLElBQ2xFLENBQUM7QUFDTCxNQUNFLFVBQVUsb0JBQ1YsQ0FBQyxPQUFPLEtBQUssVUFBVSxnQkFBZ0IsRUFBRSxRQUN6QztBQUNBLFdBQU8sVUFBVTtBQUFBLEVBQ25CO0FBRUEsU0FBTztBQUFBLElBQ0wsV0FBVztBQUFBLElBQ1gsS0FBSyxLQUFLLFNBQVMsWUFBWSxHQUFHO0FBQUEsSUFDbEM7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOO0FBQUEsTUFDQTtBQUFBLE1BQ0Esa0JBQWtCLEtBQUssU0FBUyxZQUFZLFNBQVM7QUFBQSxJQUN2RDtBQUFBLEVBQ0Y7QUFDRjs7O0FEL0pPLFNBQVMsUUFBUSxLQUF5QztBQUMvRCxRQUFNLEVBQUUsSUFBSSxJQUFJLElBQUk7QUFDcEIsUUFBTTtBQUFBLElBQ0osT0FBTyxFQUFFLElBQUksR0FBRyxNQUFNO0FBQUEsRUFDeEIsSUFBSSxJQUFJO0FBQ1IsUUFBTSxNQUFNLEVBQUUsR0FBRztBQUNqQixRQUFNLFlBQVk7QUFBQSxJQUNoQixJQUFJLEVBQUUsaUJBQWlCLEtBQUs7QUFBQSxJQUM1QixPQUFPLEVBQUUsSUFBSSxJQUFJO0FBQUEsRUFDbkI7QUFFQSxRQUFNLE9BQU87QUFBQSxJQUNYLEdBQUc7QUFBQSxJQUNILFdBQVdDLE1BQUssS0FBSyxXQUFXO0FBQUEsRUFDbEM7QUFDQSxTQUFPLHNCQUFzQixFQUFFLEtBQUssTUFBTSxVQUFVLENBQUM7QUFDdkQ7QUFFTyxTQUFTLFNBQVMsS0FBYztBQUNyQyxRQUFNLEVBQUUsT0FBTyxPQUFPLElBQUk7QUFDMUIsTUFBSSxPQUFPO0FBQ1QsV0FBT0EsTUFBSyxZQUFZLE1BQU0sU0FBUyxNQUFNLE1BQU0sTUFBTTtBQUFBLEVBQzNEO0FBQ0EsU0FBTztBQUNUOyIsCiAgIm5hbWVzIjogWyJ1dGlsIiwgInV0aWwiXQp9Cg==
