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
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { User } from '../../auth/domain/entities';
import { UserRole } from '../../auth/domain/entities';
import { CurrentUser, Public, Roles } from '../../auth/presentation/decorators';
import { JwtAuthGuard, RolesGuard } from '../../auth/presentation/guards';
import {
  BulkCreateMoviesCommand,
  BulkDeleteMoviesCommand,
  CreateMovieCommand,
  DeleteMovieCommand,
  UpdateMovieCommand,
} from '../application/commands';
import {
  BulkCreateMoviesDto,
  BulkDeleteMoviesDto,
  CreateMovieDto,
  GetMoviesDto,
  UpdateMovieDto,
} from '../application/dto';
import { GetMovieByIdQuery, GetMoviesQuery } from '../application/queries';

@ApiTags('Movies')
@Controller('movies/v1')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MoviesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles(UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new movie (Manager only)' })
  @ApiResponse({
    status: 201,
    description: 'Movie created successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Manager only' })
  async create(@Body() dto: CreateMovieDto, @CurrentUser() user: User) {
    return this.commandBus.execute(
      new CreateMovieCommand(
        dto.title,
        dto.description,
        dto.ageRestriction,
        user.id,
        user.role,
      ),
    );
  }

  @Post('bulk')
  @Roles(UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create multiple movies (Manager only)' })
  @ApiResponse({
    status: 201,
    description: 'Movies created successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Manager only' })
  async bulkCreate(
    @Body() dto: BulkCreateMoviesDto,
    @CurrentUser() user: User,
  ) {
    return this.commandBus.execute(
      new BulkCreateMoviesCommand(dto.movies, user.id, user.role),
    );
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all movies (Public, cached 30s with lock)' })
  @ApiResponse({
    status: 200,
    description: 'List of movies',
  })
  async findAll(@Query() query: GetMoviesDto) {
    return this.queryBus.execute(
      new GetMoviesQuery(
        query.skip,
        query.take,
        query.sortBy,
        query.sortOrder,
        query.maxAgeRestriction,
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
  })
  async findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetMovieByIdQuery(id));
  }

  @Put(':id')
  @Roles(UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a movie (Manager only)' })
  @ApiParam({ name: 'id', description: 'Movie ID' })
  @ApiResponse({
    status: 200,
    description: 'Movie updated successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Manager only' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMovieDto,
    @CurrentUser() user: User,
  ) {
    return this.commandBus.execute(
      new UpdateMovieCommand(
        id,
        dto.title,
        dto.description,
        dto.ageRestriction,
        user.id,
        user.role,
      ),
    );
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a movie (Manager only)' })
  @ApiParam({ name: 'id', description: 'Movie ID' })
  @ApiResponse({
    status: 200,
    description: 'Movie deleted successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Manager only' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.commandBus.execute(
      new DeleteMovieCommand(id, user.id, user.role),
    );
  }

  @Delete('bulk')
  @Roles(UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete multiple movies (Manager only)' })
  @ApiResponse({
    status: 200,
    description: 'Movies deleted successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Manager only' })
  async bulkDelete(
    @Body() dto: BulkDeleteMoviesDto,
    @CurrentUser() user: User,
  ) {
    return this.commandBus.execute(
      new BulkDeleteMoviesCommand(dto.ids, user.id, user.role),
    );
  }
}
