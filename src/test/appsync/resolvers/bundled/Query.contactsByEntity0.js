// apps/backend/src/appsync/resolvers/Query.contactsByEntity0.ts
import {
  util as util2
} from "@aws-appsync/utils";

// apps/backend/src/appsync/helpers/dynamodb.ts
import {
  util
} from "@aws-appsync/utils";
var dynamoDBGetItemRequest = (key) => {
  return {
    operation: "GetItem",
    key: util.dynamodb.toMapValues(key)
  };
};

// apps/backend/src/appsync/resolvers/Query.contactsByEntity0.ts
function request(ctx) {
  console.log("Query.tasksByEntityFrom0.ts request ctx: ", ctx);
  const { sub } = ctx.identity;
  const { entityId } = ctx.args;
  return dynamoDBGetItemRequest({
    userId: sub,
    entityId
  });
}
function response(ctx) {
  console.log("Query.tasksByEntityFrom0.ts response ctx: ", ctx);
  const { sub } = ctx.identity;
  const { error, result } = ctx;
  if (!result?.userId || result?.userId !== sub) {
    util2.unauthorized();
  }
  if (error) {
    return util2.appendError(error.message, error.type, result);
  }
  return ctx.result;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvUXVlcnkuY29udGFjdHNCeUVudGl0eTAudHMiLCAiLi4vLi4vLi4vLi4vYXBwc3luYy9oZWxwZXJzL2R5bmFtb2RiLnRzIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBO0FBQUEsRUFJRSxRQUFBQTtBQUFBLE9BQ0s7OztBQ0xQO0FBQUEsRUFXRTtBQUFBLE9BQ0s7QUFzQ0EsSUFBTSx5QkFBeUIsQ0FBQyxRQUFxQztBQUMxRSxTQUFPO0FBQUEsSUFDTCxXQUFXO0FBQUEsSUFDWCxLQUFLLEtBQUssU0FBUyxZQUFZLEdBQUc7QUFBQSxFQUNwQztBQUNGOzs7QUQvQ08sU0FBUyxRQUFRLEtBQXNDO0FBQzVELFVBQVEsSUFBSSw2Q0FBNkMsR0FBRztBQUM1RCxRQUFNLEVBQUUsSUFBSSxJQUFJLElBQUk7QUFDcEIsUUFBTSxFQUFFLFNBQVMsSUFBSSxJQUFJO0FBRXpCLFNBQU8sdUJBQXVCO0FBQUEsSUFDNUIsUUFBUTtBQUFBLElBQ1I7QUFBQSxFQUNGLENBQUM7QUFDSDtBQUVPLFNBQVMsU0FBUyxLQUFjO0FBQ3JDLFVBQVEsSUFBSSw4Q0FBOEMsR0FBRztBQUM3RCxRQUFNLEVBQUUsSUFBSSxJQUFJLElBQUk7QUFDcEIsUUFBTSxFQUFFLE9BQU8sT0FBTyxJQUFJO0FBRTFCLE1BQUksQ0FBQyxRQUFRLFVBQVUsUUFBUSxXQUFXLEtBQUs7QUFDN0MsSUFBQUMsTUFBSyxhQUFhO0FBQUEsRUFDcEI7QUFFQSxNQUFJLE9BQU87QUFDVCxXQUFPQSxNQUFLLFlBQVksTUFBTSxTQUFTLE1BQU0sTUFBTSxNQUFNO0FBQUEsRUFDM0Q7QUFFQSxTQUFPLElBQUk7QUFDYjsiLAogICJuYW1lcyI6IFsidXRpbCIsICJ1dGlsIl0KfQo=
