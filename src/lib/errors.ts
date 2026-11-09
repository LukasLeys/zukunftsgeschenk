/** Fehler mit einer Meldung, die Kundinnen und Kunden sehen dürfen. Alle anderen Fehler werden neutral gemeldet. */
export class UserError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
    this.name = "UserError";
  }
}
