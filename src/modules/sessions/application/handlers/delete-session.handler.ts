import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import type { Session } from '../../domain/entities';
import type { ISessionRepository } from '../../domain/repositories';
import { SESSION_REPOSITORY } from '../../domain/repositories';
import { DeleteSessionCommand } from '../commands';

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionHandler
  implements ICommandHandler<DeleteSessionCommand>
{
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(command: DeleteSessionCommand): Promise<Session> {
    const session = await this.sessionRepository.findById(command.id);

    if (!session) {
      throw new NotFoundException(`Session with ID ${command.id} not found`);
    }

    await this.sessionRepository.delete(command.id);
    return session;
  }
}
