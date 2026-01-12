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
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
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
  CreateRoomCommand,
  DeleteRoomCommand,
  UpdateRoomCommand,
} from '../application/commands';
import { CreateRoomDto, GetRoomsDto, UpdateRoomDto } from '../application/dto';
import { GetRoomByIdQuery, GetRoomsQuery } from '../application/queries';

@ApiTags('Rooms')
@Controller('rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoomsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('v1')
  @Roles(UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new room (Manager only)' })
  @ApiResponse({
    status: 201,
    description: 'Room created successfully',
  })
  @ApiConflictResponse({ description: 'Room number already exists' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Manager only' })
  async create(@Body() dto: CreateRoomDto, @CurrentUser() user: User) {
    return this.commandBus.execute(
      new CreateRoomCommand(dto.number, dto.capacity, user.id, user.role),
    );
  }

  @Get('v1')
  @Public()
  @ApiOperation({ summary: 'Get all rooms (Public)' })
  @ApiResponse({
    status: 200,
    description: 'List of rooms',
  })
  async findAll(@Query() query: GetRoomsDto) {
    return this.queryBus.execute(new GetRoomsQuery(query.skip, query.take));
  }

  @Get(':id/v1')
  @Public()
  @ApiOperation({ summary: 'Get a room by ID (Public)' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiResponse({
    status: 200,
    description: 'Room details',
  })
  @ApiNotFoundResponse({ description: 'Room not found' })
  async findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetRoomByIdQuery(id));
  }

  @Put(':id/v1')
  @Roles(UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a room (Manager only)' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiResponse({
    status: 200,
    description: 'Room updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Room not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Manager only' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRoomDto,
    @CurrentUser() user: User,
  ) {
    return this.commandBus.execute(
      new UpdateRoomCommand(id, dto.capacity, user.id, user.role),
    );
  }

  @Delete(':id/v1')
  @Roles(UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a room (Manager only)' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiResponse({
    status: 200,
    description: 'Room deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Room not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Manager only' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.commandBus.execute(
      new DeleteRoomCommand(id, user.id, user.role),
    );
  }
}
