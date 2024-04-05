// apps/backend/src/appsync/resolvers/Subscription.onCreateNotification.ts
import {
  util,
  extensions
} from "@aws-appsync/utils";
function request(ctx) {
  console.log("Subscription.onCreateNotification request: ", ctx);
  return { payload: null };
}
function response(ctx) {
  console.log("Subscription.onCreateNotification response: ", ctx);
  const { sub } = ctx.identity;
  const filter = { owner: { eq: sub }, status: { eq: "UNREAD" } };
  extensions.setSubscriptionFilter(util.transform.toSubscriptionFilter(filter));
  return null;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvU3Vic2NyaXB0aW9uLm9uQ3JlYXRlTm90aWZpY2F0aW9uLnRzIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBO0FBQUEsRUFDRTtBQUFBLEVBRUE7QUFBQSxPQUVLO0FBSUEsU0FBUyxRQUFRLEtBQWM7QUFDcEMsVUFBUSxJQUFJLCtDQUErQyxHQUFHO0FBRTlELFNBQU8sRUFBRSxTQUFTLEtBQUs7QUFDekI7QUFFTyxTQUFTLFNBQVMsS0FBYztBQUNyQyxVQUFRLElBQUksZ0RBQWdELEdBQUc7QUFFL0QsUUFBTSxFQUFFLElBQUksSUFBSSxJQUFJO0FBQ3BCLFFBQU0sU0FBUyxFQUFFLE9BQU8sRUFBRSxJQUFJLElBQUksR0FBRyxRQUFRLEVBQUUsSUFBSSxTQUFTLEVBQUU7QUFDOUQsYUFBVyxzQkFBc0IsS0FBSyxVQUFVLHFCQUFxQixNQUFNLENBQUM7QUFDNUUsU0FBTztBQUNUOyIsCiAgIm5hbWVzIjogW10KfQo=
