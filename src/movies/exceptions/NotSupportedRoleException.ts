export class NotSupportedRoleException extends Error {
  constructor(message?: string) {
    super();
    this.message = message;
    this.name = 'NotSupportedRoleException';
  }
}
