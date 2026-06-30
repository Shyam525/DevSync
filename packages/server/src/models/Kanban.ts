// export const placeholder = {};


import mongoose, { Schema, Document } from 'mongoose';

// ─── DESIGN DECISION: Embedded vs Referenced ─────────────────────────────
//
// Option A (Embedded — what we use):
//   KanbanBoard { columns: [{ title, cards: [{ title, ... }] }] }
//   → One document contains the ENTIRE board
//   → One DB query to load the whole board
//   → Good for: reading the board (most common operation)
//   → Bad for: if cards array grows to thousands of items (document size limit: 16MB)
//
// Option B (Referenced):
//   Separate KanbanCard collection, each card has a columnId
//   → Multiple queries needed to build the board
//   → Scales to unlimited cards
//   → Good for: very large boards with thousands of cards
//
// Decision for devSync: Embedded is correct.
// A Kanban board rarely has more than 200 cards. The 16MB limit is safe.
// And reading the whole board in ONE query keeps the real-time sync simple.

export interface IKanbanCard {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  assigneeId?: mongoose.Types.ObjectId;
  priority: 'low' | 'medium' | 'high';
  order: number;             // Position within column (0 = top, higher = lower)
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface IKanbanColumn {
  _id: mongoose.Types.ObjectId;
  title: string;
  order: number;             // Position of this column in the board
  cards: IKanbanCard[];
}

export interface IKanban extends Document {
  projectId: mongoose.Types.ObjectId;
  columns: IKanbanColumn[];
  createdAt: Date;
  updatedAt: Date;
}

const KanbanCardSchema = new Schema<IKanbanCard>({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  assigneeId: { type: Schema.Types.ObjectId, ref: 'User' },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  order: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

const KanbanColumnSchema = new Schema<IKanbanColumn>({
  title: { type: String, required: true, trim: true },
  order: { type: Number, default: 0 },
  cards: { type: [KanbanCardSchema], default: [] },
});

const KanbanSchema = new Schema<IKanban>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      unique: true,            // ONE board per project — enforced at DB level
    },
    columns: {
      type: [KanbanColumnSchema],
      // Default columns created automatically when the board is created
      default: [
        { title: 'To Do', order: 0, cards: [] },
        { title: 'In Progress', order: 1, cards: [] },
        { title: 'Done', order: 2, cards: [] },
      ],
    },
  },
  { timestamps: true }
);

KanbanSchema.index({ projectId: 1 });

export const Kanban = mongoose.model<IKanban>('Kanban', KanbanSchema);