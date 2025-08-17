import { EventEmitter } from 'events';

// Cache entry interface
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

// Cache configuration
interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
  enableLRU: boolean;
  enableCompression: boolean;
}

// Cache statistics
interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  maxSize: number;
  hitRate: number;
  memoryUsage: number;
}

// Advanced cache service with LRU eviction and performance optimization
export class CacheService extends EventEmitter {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private config: CacheConfig;
  private stats: CacheStats;
  private cleanupInterval!: NodeJS.Timeout;

  private constructor(config: Partial<CacheConfig> = {}) {
    super();
    
    this.config = {
      maxSize: config.maxSize || 1000,
      defaultTTL: config.defaultTTL || 300000, // 5 minutes
      cleanupInterval: config.cleanupInterval || 60000, // 1 minute
      enableLRU: config.enableLRU !== false,
      enableCompression: config.enableCompression || false
    };

    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      maxSize: this.config.maxSize,
      hitRate: 0,
      memoryUsage: 0
    };

    this.startCleanupInterval();
  }

  static getInstance(config?: Partial<CacheConfig>): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService(config);
    }
    return CacheService.instance;
  }

  // Set cache entry
  set<T>(key: string, value: T, ttl?: number): void {
    const entryTTL = ttl || this.config.defaultTTL;
    const timestamp = Date.now();

    // Check if we need to evict entries
    if (this.cache.size >= this.config.maxSize) {
      this.evictEntries();
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp,
      ttl: entryTTL,
      accessCount: 0,
      lastAccessed: timestamp
    };

    this.cache.set(key, entry);
    this.stats.size = this.cache.size;
    this.updateMemoryUsage();

    this.emit('set', { key, value, ttl: entryTTL });
  }

  // Get cache entry
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T>;

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      this.emit('miss', { key });
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      this.emit('expired', { key });
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;
    this.updateHitRate();

    this.emit('hit', { key, value: entry.value });
    return entry.value;
  }

  // Get or set cache entry (cache-aside pattern)
  async getOrSet<T>(
    key: string, 
    fetchFunction: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    try {
      const value = await fetchFunction();
      this.set(key, value, ttl);
      return value;
    } catch (error) {
      this.emit('fetch_error', { key, error });
      throw error;
    }
  }

  // Delete cache entry
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.size = this.cache.size;
      this.updateMemoryUsage();
      this.emit('delete', { key });
    }
    return deleted;
  }

  // Clear all cache entries
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.size = 0;
    this.updateMemoryUsage();
    this.emit('clear', { size });
  }

  // Check if key exists
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // Get cache statistics
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Get cache keys
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }

  // Set multiple cache entries
  mset(entries: Array<{ key: string; value: any; ttl?: number }>): void {
    entries.forEach(({ key, value, ttl }) => {
      this.set(key, value, ttl);
    });
  }

  // Get multiple cache entries
  mget<T>(keys: string[]): (T | null)[] {
    return keys.map(key => this.get<T>(key));
  }

  // Delete multiple cache entries
  mdelete(keys: string[]): number {
    let deletedCount = 0;
    keys.forEach(key => {
      if (this.delete(key)) {
        deletedCount++;
      }
    });
    return deletedCount;
  }

  // Pattern-based cache invalidation
  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    const keysToDelete = this.keys().filter(key => regex.test(key));
    return this.mdelete(keysToDelete);
  }

  // Cache warming (pre-populate cache)
  async warmCache<T>(
    keys: string[],
    fetchFunction: (key: string) => Promise<T>,
    ttl?: number
  ): Promise<void> {
    const promises = keys.map(async key => {
      try {
        const value = await fetchFunction(key);
        this.set(key, value, ttl);
      } catch (error) {
        this.emit('warm_error', { key, error });
      }
    });

    await Promise.all(promises);
    this.emit('warmed', { keys });
  }

  // Cache entry with tags for selective invalidation
  setWithTags<T>(key: string, value: T, tags: string[], ttl?: number): void {
    const entry: CacheEntry<T> & { tags: string[] } = {
      value,
      tags,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    this.cache.set(key, entry);
    this.stats.size = this.cache.size;
    this.updateMemoryUsage();
  }

  // Invalidate cache entries by tags
  invalidateByTags(tags: string[]): number {
    let deletedCount = 0;
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      const entryWithTags = entry as CacheEntry<any> & { tags?: string[] };
      if (entryWithTags.tags && entryWithTags.tags.some((tag: string) => tags.includes(tag))) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      if (this.delete(key)) {
        deletedCount++;
      }
    });

    return deletedCount;
  }

  // LRU eviction strategy
  private evictEntries(): void {
    if (!this.config.enableLRU) {
      // Simple FIFO eviction
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.delete(firstKey);
        this.stats.evictions++;
      }
      return;
    }

    // LRU eviction based on last accessed time
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    this.cache.forEach((entry, key) => {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  // Update hit rate
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  // Update memory usage estimation
  private updateMemoryUsage(): void {
    let totalSize = 0;
    this.cache.forEach((entry, key) => {
      totalSize += JSON.stringify(key).length;
      totalSize += JSON.stringify(entry.value).length;
      totalSize += JSON.stringify(entry).length;
    });
    this.stats.memoryUsage = totalSize;
  }

  // Cleanup expired entries
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.delete(key);
    });

    if (keysToDelete.length > 0) {
      this.emit('cleanup', { expiredCount: keysToDelete.length });
    }
  }

  // Start cleanup interval
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, this.config.cleanupInterval);
  }

  // Stop cleanup interval
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  // Reset statistics
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0,
      memoryUsage: 0
    };
    this.updateMemoryUsage();
  }

  // Export cache data
  export(): any {
    const data: any = {};
    this.cache.forEach((entry, key) => {
      data[key] = {
        value: entry.value,
        timestamp: entry.timestamp,
        ttl: entry.ttl,
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessed
      };
    });

    return {
      data,
      stats: this.getStats(),
      config: this.config
    };
  }

  // Import cache data
  import(data: any): void {
    if (data.data) {
      Object.entries(data.data).forEach(([key, entry]: [string, any]) => {
        this.cache.set(key, entry);
      });
      this.stats.size = this.cache.size;
      this.updateMemoryUsage();
    }
  }
}

// Cache decorator for methods
export function Cached(ttl?: number, keyGenerator?: (...args: any[]) => string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const cache = CacheService.getInstance();

    descriptor.value = async function (...args: any[]) {
      const key = keyGenerator 
        ? keyGenerator(...args)
        : `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;

      return cache.getOrSet(key, () => method.apply(this, args), ttl);
    };
  };
}

// Cache tags decorator
export function CachedWithTags(tags: string[], ttl?: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const cache = CacheService.getInstance();

    descriptor.value = async function (...args: any[]) {
      const key = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
      
      const cached = cache.get(key);
      if (cached !== null) {
        return cached;
      }

      const value = await method.apply(this, args);
      cache.setWithTags(key, value, tags, ttl);
      return value;
    };
  };
}

// Export singleton instance
export const cacheService = CacheService.getInstance();
