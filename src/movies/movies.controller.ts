import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public, Roles } from '../auth/decorators';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import {
  CreateMovieCommand,
  DeleteMovieCommand,
  UpdateMovieCommand,
} from './commands';
import { CreateMovieDto, UpdateMovieDto } from './dto';
import { MovieEntity } from './entities';
import { GetMovieByIdQuery, GetMoviesQuery } from './queries';

@ApiTags('Movies')
@Controller('movies/v1')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MoviesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new movie (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Movie created successfully',
    type: MovieEntity,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin only' })
  async create(@Body() dto: CreateMovieDto) {
    return this.commandBus.execute(
      new CreateMovieCommand(
        dto.title,
        dto.description,
        dto.releaseYear,
        dto.rating,
      ),
    );
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all movies (Public)' })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of records to skip',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of records to take',
  })
  @ApiResponse({
    status: 200,
    description: 'List of movies',
    type: [MovieEntity],
  })
  async findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.queryBus.execute(
      new GetMoviesQuery(
        skip ? Number.parseInt(skip, 10) : undefined,
        take ? Number.parseInt(take, 10) : undefined,
      ),
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a movie by ID (Public)' })
  @ApiParam({ name: 'id', description: 'Movie ID' })
  @ApiResponse({
    status: 200,
    description: 'Movie details',
    type: MovieEntity,
  })
  async findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetMovieByIdQuery(id));
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a movie (Admin only)' })
  @ApiParam({ name: 'id', description: 'Movie ID' })
  @ApiResponse({
    status: 200,
    description: 'Movie updated successfully',
    type: MovieEntity,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin only' })
  async update(@Param('id') id: string, @Body() dto: UpdateMovieDto) {
    return this.commandBus.execute(
      new UpdateMovieCommand(
        id,
        dto.title,
        dto.description,
        dto.releaseYear,
        dto.rating,
      ),
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a movie (Admin only)' })
  @ApiParam({ name: 'id', description: 'Movie ID' })
  @ApiResponse({
    status: 200,
    description: 'Movie deleted successfully',
    type: MovieEntity,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin only' })
  async remove(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteMovieCommand(id));
  }
}
