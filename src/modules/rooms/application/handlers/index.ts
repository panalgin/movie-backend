import { CreateRoomHandler } from './create-room.handler';
import { DeleteRoomHandler } from './delete-room.handler';
import { GetRoomByIdHandler } from './get-room-by-id.handler';
import { GetRoomsHandler } from './get-rooms.handler';
import { UpdateRoomHandler } from './update-room.handler';

export const CommandHandlers = [
  CreateRoomHandler,
  DeleteRoomHandler,
  UpdateRoomHandler,
];

export const QueryHandlers = [GetRoomsHandler, GetRoomByIdHandler];

export {
  CreateRoomHandler,
  DeleteRoomHandler,
  GetRoomByIdHandler,
  GetRoomsHandler,
  UpdateRoomHandler,
};
