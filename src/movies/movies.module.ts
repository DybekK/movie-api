import { HttpModule, MiddlewareConsumer, Module } from '@nestjs/common';
import { MoviesController } from './endpoints/movies.controller';
import { MoviesService } from './services/movies.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Movie, MovieSchema } from './dataSources/mongo/movie.schema';
import { ConfigModule } from '@nestjs/config';
import { MoviesApiClient } from './dataSources/moviesApi.client';
import { AuthMiddleware } from './auth/auth.middleware';
import { MoviesRepository } from './dataSources/mongo/movies.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.env.NODE_ENV}.env`,
    }),
    MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
    HttpModule,
  ],
  controllers: [MoviesController],
  providers: [MoviesService, MoviesApiClient, MoviesRepository],
})
export class MoviesModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('movies');
  }
}
