// apps/backend/src/appsync/resolvers/Mutation.deleteEntity.ts
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

// apps/backend/src/appsync/resolvers/Mutation.deleteEntity.ts
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvTXV0YXRpb24uZGVsZXRlRW50aXR5LnRzIiwgIi4uLy4uLy4uLy4uL2FwcHN5bmMvaGVscGVycy9jb2duaXRvLnRzIiwgIi4uLy4uLy4uLy4uL2FwcHN5bmMvaGVscGVycy9keW5hbW9kYi50cyJdLAogICJtYXBwaW5ncyI6ICI7QUFBQTtBQUFBLEVBRUUsUUFBQUE7QUFBQSxPQUlLOzs7QUNOUCxTQUFTLFlBQWlDO0FBQ25DLElBQU0sY0FBYztBQUFBLEVBQ3pCLGNBQWM7QUFBQSxFQUNkLFFBQVE7QUFBQSxFQUNSLE9BQU87QUFDVDtBQVNPLElBQU0sVUFBVSxDQUFDLFdBQTRCO0FBQ2xELFNBQ0UsUUFBUSxTQUFTLFlBQVksWUFBWSxLQUN6QyxRQUFRLFNBQVMsWUFBWSxNQUFNO0FBRXZDOzs7QUNuQkE7QUFBQSxFQVdFLFFBQUFDO0FBQUEsT0FDSztBQVNBLElBQU0sd0JBQXdCLENBQUM7QUFBQSxFQUNwQztBQUFBLEVBQ0EsV0FBVyxZQUFZLENBQUM7QUFDMUIsTUFBdUM7QUFFckMsUUFBTSxZQUFZLEtBQUs7QUFBQSxJQUNyQkEsTUFBSyxVQUFVLDhCQUE4QixTQUFTO0FBQUEsRUFDeEQ7QUFDQSxNQUNFLFVBQVUsb0JBQ1YsQ0FBQyxPQUFPLEtBQUssVUFBVSxnQkFBZ0IsRUFBRSxRQUN6QztBQUNBLFdBQU8sVUFBVTtBQUFBLEVBQ25CO0FBRUEsTUFBSSxXQUFXO0FBQ2IsV0FBTztBQUFBLE1BQ0wsV0FBVztBQUFBLE1BQ1gsS0FBS0EsTUFBSyxTQUFTLFlBQVksR0FBRztBQUFBLE1BQ2xDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFFQSxTQUFPO0FBQUEsSUFDTCxXQUFXO0FBQUEsSUFDWCxLQUFLQSxNQUFLLFNBQVMsWUFBWSxHQUFHO0FBQUEsRUFDcEM7QUFDRjs7O0FGdENPLFNBQVMsUUFBUSxLQUFzQztBQUM1RCxRQUFNLEVBQUUsS0FBSyxPQUFPLElBQUksSUFBSTtBQUM1QixRQUFNO0FBQUEsSUFDSixXQUFXO0FBQUEsTUFDVCxPQUFPLEVBQUUsR0FBRztBQUFBLElBQ2Q7QUFBQSxFQUNGLElBQUk7QUFFSixNQUFJLFlBQWtDLENBQUM7QUFDdkMsUUFBTSxNQUFNLEVBQUUsR0FBRztBQUVqQixNQUFJQyxNQUFLLFNBQVMsTUFBTSx1QkFBdUIsQ0FBQyxRQUFRLE1BQU0sR0FBRztBQUMvRCxnQkFBWTtBQUFBLE1BQ1YsT0FBTyxFQUFFLElBQUksSUFBSTtBQUFBLElBQ25CO0FBQUEsRUFDRjtBQUVBLFNBQU8sc0JBQXNCLEVBQUUsS0FBSyxVQUFVLENBQUM7QUFDakQ7QUFFTyxTQUFTLFNBQVMsS0FBYztBQUNyQyxRQUFNLEVBQUUsT0FBTyxPQUFPLElBQUk7QUFDMUIsTUFBSSxPQUFPO0FBQ1QsV0FBT0EsTUFBSyxZQUFZLE1BQU0sU0FBUyxNQUFNLE1BQU0sTUFBTTtBQUFBLEVBQzNEO0FBQ0EsU0FBTyxJQUFJO0FBQ2I7IiwKICAibmFtZXMiOiBbInV0aWwiLCAidXRpbCIsICJ1dGlsIl0KfQo=
