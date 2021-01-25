import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Movie extends Document {
  @Prop()
  userId: number;

  @Prop()
  title: string;

  @Prop()
  released: string;

  @Prop()
  genre: string;

  @Prop()
  director: string;
}
export const MovieSchema = SchemaFactory.createForClass(Movie);
