import mongoose from 'mongoose';
import { Kanban, IKanban } from '../models/Kanban';
import { NotFoundError } from '../errors';
import { logger } from '../logger';

interface CreateCardInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface UpdateCardInput {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface MoveCardInput {
  cardId: string;
  fromColumnId: string;
  toColumnId: string;
  newOrder: number;
}

export const kanbanService = {

  // ─── GET OR CREATE ────────────────────────────────────────────────────
  // Every project needs exactly one board. Instead of creating it when
  // the project is created (which would mean touching Week 4's
  // project.service.ts), we create it lazily — the first time anyone
  // asks for it. Recall from Week 2: the Kanban schema already has
  // `default` columns (To Do, In Progress, Done) built in, so
  // Kanban.create({ projectId }) needs nothing else.
  getOrCreateBoard: async (projectId: string): Promise<IKanban> => {
    let board = await Kanban.findOne({ projectId });
    if (!board) {
      board = await Kanban.create({ projectId });
      logger.info({ projectId }, 'Kanban board created with default columns');
    }
    return board;
  },

  // ─── CREATE CARD ────────────────────────────────────────────────────
  createCard: async (
    projectId: string,
    columnId: string,
    input: CreateCardInput,
    userId: string
  ): Promise<IKanban> => {
    const board = await Kanban.findOne({ projectId });
    if (!board) throw new NotFoundError('Kanban board');

    const column = board.columns.find((c) => c._id.toString() === columnId);
    if (!column) throw new NotFoundError('Column');

    // We supply _id ourselves. Mongoose WOULD auto-generate one if we
    // left it out — but our own IKanbanCard interface (Week 2) requires
    // _id to be present, so we generate it the same way Mongoose does
    // internally. This keeps TypeScript satisfied without an `as any` cast.
    column.cards.push({
      _id: new mongoose.Types.ObjectId(),
      title: input.title,
      description: input.description,
      priority: input.priority || 'medium',
      order: column.cards.length,
      createdBy: new mongoose.Types.ObjectId(userId),
      createdAt: new Date(),
    });

    await board.save();
    logger.info({ projectId, columnId }, 'Card created');
    return board;
  },

  // ─── UPDATE CARD ────────────────────────────────────────────────────
  updateCard: async (
    projectId: string,
    cardId: string,
    input: UpdateCardInput
  ): Promise<IKanban> => {
    const board = await Kanban.findOne({ projectId });
    if (!board) throw new NotFoundError('Kanban board');

    // A card could be in ANY column — search all of them.
    let foundCard = null;
    for (const column of board.columns) {
      const card = column.cards.find((c) => c._id.toString() === cardId);
      if (card) {
        foundCard = card;
        break;
      }
    }
    if (!foundCard) throw new NotFoundError('Card');

    if (input.title !== undefined) foundCard.title = input.title;
    if (input.description !== undefined) foundCard.description = input.description;
    if (input.priority !== undefined) foundCard.priority = input.priority;

    await board.save();
    return board;
  },

  // ─── MOVE CARD — the most important function this week ───────────────
  moveCard: async (
    projectId: string,
    input: MoveCardInput
  ): Promise<IKanban> => {
    const board = await Kanban.findOne({ projectId });
    if (!board) throw new NotFoundError('Kanban board');

    const fromColumn = board.columns.find((c) => c._id.toString() === input.fromColumnId);
    if (!fromColumn) throw new NotFoundError('Source column');

    const cardIndex = fromColumn.cards.findIndex((c) => c._id.toString() === input.cardId);
    if (cardIndex === -1) throw new NotFoundError('Card');

    // STEP A: remove the card from wherever it currently lives.
    // splice(index, 1) removes exactly one item and RETURNS it —
    // that returned card is what we insert into the destination below.
    const [card] = fromColumn.cards.splice(cardIndex, 1);

    const toColumn = board.columns.find((c) => c._id.toString() === input.toColumnId);
    if (!toColumn) throw new NotFoundError('Destination column');

    // STEP B: insert it at the requested position in the new column.
    // splice(index, 0, item) inserts WITHOUT removing anything.
    toColumn.cards.splice(input.newOrder, 0, card);

    // STEP C: reassign `order` on every card in BOTH affected columns
    // so the stored order field always matches actual array position.
    // Without this, after several moves the order numbers would drift
    // out of sync with where cards visually sit.
    fromColumn.cards.forEach((c, i) => { c.order = i; });
    toColumn.cards.forEach((c, i) => { c.order = i; });

    await board.save();
    logger.info(
      { projectId, cardId: input.cardId, from: input.fromColumnId, to: input.toColumnId },
      'Card moved'
    );
    return board;
  },
};