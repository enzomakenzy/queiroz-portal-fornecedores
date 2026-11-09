import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserPayload } from "./jwt-strategy.service";

export const CurrentUser = createParamDecorator(
  (_, context: ExecutionContext) => {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: UserPayload }>();

    return request.user;
  },
);
