import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
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
  CreateSessionCommand,
  DeleteSessionCommand,
} from '../application/commands';
import { CreateSessionDto, GetSessionsDto } from '../application/dto';
import { GetSessionByIdQuery, GetSessionsQuery } from '../application/queries';

@ApiTags('Sessions')
@Controller('sessions/v1')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles(UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new session (Manager only)' })
  @ApiResponse({
    status: 201,
    description: 'Session created successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Manager only' })
  async create(@Body() dto: CreateSessionDto, @CurrentUser() user: User) {
    return this.commandBus.execute(
      new CreateSessionCommand(
        dto.movieId,
        new Date(dto.date),
        dto.timeSlot,
        dto.roomNumber,
        user.id,
        user.role,
      ),
    );
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all sessions (Public)' })
  @ApiResponse({
    status: 200,
    description: 'List of sessions',
  })
  async findAll(@Query() query: GetSessionsDto) {
    return this.queryBus.execute(
      new GetSessionsQuery(
        query.movieId,
        query.date ? new Date(query.date) : undefined,
        query.roomNumber,
        query.skip,
        query.take,
      ),
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a session by ID (Public)' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({
    status: 200,
    description: 'Session details',
  })
  async findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetSessionByIdQuery(id));
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a session (Manager only)' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({
    status: 200,
    description: 'Session deleted successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Manager only' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.commandBus.execute(
      new DeleteSessionCommand(id, user.id, user.role),
    );
  }
}
