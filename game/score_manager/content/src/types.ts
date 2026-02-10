export interface SubmitGameRequest {
  password: string;
  results: GameResults;
}

export interface GameResults {
  first: string;
  second: string;
  third: string;
  fourth: string;
}

export enum Errors {
}