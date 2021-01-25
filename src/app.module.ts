import { Module } from '@nestjs/common';
import { MoviesModule } from './movies/movies.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(`mongodb://${process.env.MONGO_URI}`, {
      dbName: process.env.MONGO_DATABASE_NAME,
      user: process.env.MONGO_USERNAME,
      pass: process.env.MONGO_PASSWORD,
    }),
    MoviesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
