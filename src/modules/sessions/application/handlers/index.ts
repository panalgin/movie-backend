import { CreateSessionHandler } from './create-session.handler';
import { DeleteSessionHandler } from './delete-session.handler';
import { GetSessionByIdHandler } from './get-session-by-id.handler';
import { GetSessionsHandler } from './get-sessions.handler';
import { UpdateSessionHandler } from './update-session.handler';

export const CommandHandlers = [
  CreateSessionHandler,
  DeleteSessionHandler,
  UpdateSessionHandler,
];

export const QueryHandlers = [GetSessionsHandler, GetSessionByIdHandler];

export {
  CreateSessionHandler,
  DeleteSessionHandler,
  GetSessionByIdHandler,
  GetSessionsHandler,
  UpdateSessionHandler,
};
