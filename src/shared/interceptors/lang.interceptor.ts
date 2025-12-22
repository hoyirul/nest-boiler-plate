import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { Loggers } from "@/shared/utils/logger";

@Injectable()
export class LangInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    const lang =
      (req.headers["accept-language"] as string)?.toLowerCase() || "id";

    req.lang = lang;

    Object.values(Loggers).forEach((logger) => logger.setLang(lang));

    return next.handle();
  }
}
