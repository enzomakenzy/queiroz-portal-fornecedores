import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";
import { ZodError, ZodType } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        const path = error.issues[0].path;
        const messageError = error.issues[0].message;

        throw new BadRequestException({
          path: path[0],
          message: `${messageError}`,
          error: "Valition Error",
        });
      }

      throw new BadRequestException("Validation failed");
    }
  }
}
