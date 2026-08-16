const BehaviorEvent = require('../../models/BehaviorEvent');
const EventEmitter = require('events');

class BehaviorEventEmitter extends EventEmitter {}
const behaviorBus = new BehaviorEventEmitter();

/**
 * Record a behavior event into the database and notify event listeners.
 */
async function trackBehaviorEvent(userId, eventType, data = {}) {
  try {
    if (!userId || !eventType) return null;

    const event = await BehaviorEvent.create({
      userId,
      eventType,
      entityType: data.entityType || 'General',
      entityId: data.entityId || null,
      payload: data.payload || {},
      metadata: {
        clientTime: data.clientTime || new Date().toISOString(),
        timeOfDay: data.timeOfDay || getTimeOfDay(new Date()),
        dayOfWeek: data.dayOfWeek || getDayOfWeek(new Date()),
        durationMinutes: data.durationMinutes || 0,
      },
    });

    // Emit event asynchronously
    behaviorBus.emit(eventType, { userId, event });
    behaviorBus.emit('any_event', { userId, eventType, event });

    return event;
  } catch (err) {
    console.error('Failed to record behavior event:', err.message);
    return null;
  }
}

/**
 * Query recent behavior events for a user
 */
async function getRecentEvents(userId, options = {}) {
  const limit = options.limit || 50;
  const eventTypes = options.eventTypes || [];

  const query = { userId };
  if (eventTypes.length > 0) {
    query.eventType = { $in: eventTypes };
  }

  return BehaviorEvent.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

function getTimeOfDay(date) {
  const h = date.getHours();
  if (h >= 5 && h < 12) return 'MORNING';
  if (h >= 12 && h < 17) return 'AFTERNOON';
  if (h >= 17 && h < 21) return 'EVENING';
  return 'NIGHT';
}

function getDayOfWeek(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

module.exports = {
  trackBehaviorEvent,
  getRecentEvents,
  behaviorBus,
};
