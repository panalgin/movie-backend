import { CreateRoomHandler } from './create-room.handler';
import { CreateSessionHandler } from './create-session.handler';
import { DeleteRoomHandler } from './delete-room.handler';
import { DeleteSessionHandler } from './delete-session.handler';
import { GetRoomByIdHandler } from './get-room-by-id.handler';
import { GetRoomsHandler } from './get-rooms.handler';
import { GetSessionByIdHandler } from './get-session-by-id.handler';
import { GetSessionsHandler } from './get-sessions.handler';
import { UpdateRoomHandler } from './update-room.handler';
import { UpdateSessionHandler } from './update-session.handler';

export const CommandHandlers = [
  CreateSessionHandler,
  DeleteSessionHandler,
  UpdateSessionHandler,
  CreateRoomHandler,
  UpdateRoomHandler,
  DeleteRoomHandler,
];

export const QueryHandlers = [
  GetSessionsHandler,
  GetSessionByIdHandler,
  GetRoomsHandler,
  GetRoomByIdHandler,
];

export {
  CreateSessionHandler,
  DeleteSessionHandler,
  UpdateSessionHandler,
  GetSessionsHandler,
  GetSessionByIdHandler,
  CreateRoomHandler,
  UpdateRoomHandler,
  DeleteRoomHandler,
  GetRoomsHandler,
  GetRoomByIdHandler,
};
