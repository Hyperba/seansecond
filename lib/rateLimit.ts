type RateLimitStore = Map<string, { count: number; resetTime: number }>;

const stores: Map<string, RateLimitStore> = new Map();

export function rateLimit(namespace: string, limit = 5, windowMs = 60000) {
  if (!stores.has(namespace)) {
    stores.set(namespace, new Map());
  }
  
  const store = stores.get(namespace)!;

  return {
    check: (identifier: string): { success: boolean; remaining: number } => {
      const now = Date.now();
      const record = store.get(identifier);

      if (!record || now > record.resetTime) {
        store.set(identifier, { count: 1, resetTime: now + windowMs });
        return { success: true, remaining: limit - 1 };
      }

      if (record.count >= limit) {
        return { success: false, remaining: 0 };
      }

      record.count += 1;
      return { success: true, remaining: limit - record.count };
    },
  };
}

setInterval(() => {
  const now = Date.now();
  stores.forEach((store) => {
    store.forEach((record, key) => {
      if (now > record.resetTime) {
        store.delete(key);
      }
    });
  });
}, 60000);
