export class ExceededLimitException extends Error {
  constructor(message?: string) {
    super();
    this.message = message;
    this.name = 'ExceededLimitException';
  }
}
