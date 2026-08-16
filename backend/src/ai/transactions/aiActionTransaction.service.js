const AIActionTransaction = require('../../models/AIActionTransaction');
const Habit = require('../../models/Habit');
const CalendarEvent = require('../../models/CalendarEvent');

class AIActionTransactionService {
  /**
   * Stages a multi-action transaction with before_state snapshots.
   */
  static async stageTransaction(userId, { title, actionType, beforeState, afterState, changesSummary }) {
    const transaction = await AIActionTransaction.create({
      userId,
      title,
      actionType,
      status: 'STAGED',
      beforeState,
      afterState,
      changesSummary,
    });
    return transaction;
  }

  /**
   * Confirms and applies staged changes.
   */
  static async confirmTransaction(userId, transactionId) {
    const tx = await AIActionTransaction.findOne({ _id: transactionId, userId });
    if (!tx) throw new Error('Transaction not found');

    tx.status = 'CONFIRMED';
    tx.confirmedAt = new Date();
    await tx.save();

    return {
      success: true,
      transactionId: tx._id.toString(),
      message: `Transaction "${tx.title}" confirmed and executed.`,
    };
  }

  /**
   * Rolls back a previously confirmed transaction by restoring before_state.
   */
  static async rollback(userId, transactionId) {
    const tx = await AIActionTransaction.findOne({ _id: transactionId, userId });
    if (!tx) throw new Error('Transaction not found or unauthorized.');
    if (tx.status === 'ROLLED_BACK') throw new Error('Transaction is already rolled back.');

    // Restore state based on actionType
    if (tx.actionType === 'HABIT_TIME_ADJUSTMENT' && tx.beforeState?.habitId) {
      await Habit.findOneAndUpdate(
        { _id: tx.beforeState.habitId, userId },
        { preferredTime: tx.beforeState.originalTime }
      );
    } else if (tx.actionType === 'BATCH_SCHEDULE_OPTIMIZATION' && tx.beforeState?.events) {
      // Revert events to original beforeState
      for (const evt of tx.beforeState.events) {
        await CalendarEvent.findOneAndUpdate(
          { _id: evt.id, userId },
          { startTime: evt.startTime, endTime: evt.endTime, date: evt.date }
        );
      }
    }

    tx.status = 'ROLLED_BACK';
    tx.rolledBackAt = new Date();
    await tx.save();

    return {
      success: true,
      transactionId: tx._id.toString(),
      message: `Transaction "${tx.title}" rolled back successfully. Previous state restored.`,
    };
  }
}

module.exports = AIActionTransactionService;
