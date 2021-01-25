import { Injectable } from '@nestjs/common';
import { Movie } from './movie.schema';
import { Model } from 'mongoose';
import { endOfMonth, startOfMonth } from 'date-fns';
import { MovieDto } from '../movieDto';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class MoviesRepository {
  constructor(
    @InjectModel(Movie.name) private readonly movieModel: Model<Movie>,
  ) {}
  async create(userId: number, movieDto: MovieDto): Promise<Movie> {
    movieDto.userId = userId;
    const createdMovie = new this.movieModel(movieDto);
    return createdMovie.save();
  }

  async findMoviesByUser(userId: number): Promise<Movie[]> {
    return this.movieModel.find({ userId }).exec();
  }

  async countUserMoviesInMonth(userId: number): Promise<number> {
    return await this.movieModel
      .find({
        userId,
        createdAt: {
          $gte: startOfMonth(new Date()).toISOString(),
          $lt: endOfMonth(new Date()).toISOString(),
        },
      })
      .countDocuments()
      .exec();
  }
}
