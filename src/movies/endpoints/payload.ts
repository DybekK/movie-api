import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class Payload {
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  title: string;
}
