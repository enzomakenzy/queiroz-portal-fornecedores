export class WrongCredentialsError extends Error {
  constructor() {
    super("Incorrect email or password");
  }
}
