import Redis from 'ioredis';
import { EventEmitter } from 'events';

// Redis cache configuration
interface RedisCacheConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
  defaultTTL: number;
  maxRetries: number;
  retryDelay: number;
  enableOfflineQueue: boolean;
  lazyConnect: boolean;
}

// Cache entry interface
interface RedisCacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  version: string;
}

// Cache statistics
interface RedisCacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  hitRate: number;
  memoryUsage: number;
  connectedClients: number;
}

// Redis cache service implementation
export class RedisCacheService extends EventEmitter {
  private static instance: RedisCacheService;
  private redis!: Redis;
  private config: RedisCacheConfig;
  private stats: RedisCacheStats;
  private isConnected: boolean = false;

  private constructor(config: Partial<RedisCacheConfig> = {}) {
    super();
    
    this.config = {
      host: config.host || process.env.REDIS_HOST || 'localhost',
      port: config.port || parseInt(process.env.REDIS_PORT || '6379'),
      password: config.password || process.env.REDIS_PASSWORD,
      db: config.db || 0,
      keyPrefix: config.keyPrefix || 'lti:cache:',
      defaultTTL: config.defaultTTL || 300000, // 5 minutes
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      enableOfflineQueue: config.enableOfflineQueue !== false,
      lazyConnect: config.lazyConnect !== false
    };

    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      hitRate: 0,
      memoryUsage: 0,
      connectedClients: 0
    };

    this.initializeRedis();
  }

  static getInstance(config?: Partial<RedisCacheConfig>): RedisCacheService {
    if (!RedisCacheService.instance) {
      RedisCacheService.instance = new RedisCacheService(config);
    }
    return RedisCacheService.instance;
  }

  private initializeRedis(): void {
    this.redis = new Redis({
      host: this.config.host,
      port: this.config.port,
      password: this.config.password,
      db: this.config.db,
      keyPrefix: this.config.keyPrefix,
      maxRetriesPerRequest: null,
      enableOfflineQueue: this.config.enableOfflineQueue,
      lazyConnect: this.config.lazyConnect,
      retryStrategy: (times) => {
        const delay = Math.min(times * this.config.retryDelay, 30000);
        return delay;
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.redis.on('connect', () => {
      this.isConnected = true;
      console.log('[REDIS_CACHE] Connected to Redis');
      this.emit('connected');
    });

    this.redis.on('ready', () => {
      console.log('[REDIS_CACHE] Redis is ready');
      this.emit('ready');
    });

    this.redis.on('error', (error) => {
      this.stats.errors++;
      console.error('[REDIS_CACHE] Redis error:', error);
      this.emit('error', error);
    });

    this.redis.on('close', () => {
      this.isConnected = false;
      console.log('[REDIS_CACHE] Redis connection closed');
      this.emit('disconnected');
    });

    this.redis.on('reconnecting', () => {
      console.log('[REDIS_CACHE] Reconnecting to Redis...');
      this.emit('reconnecting');
    });
  }

  // Set cache entry
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const entry: RedisCacheEntry<T> = {
        value,
        timestamp: Date.now(),
        ttl: ttl || this.config.defaultTTL,
        version: '1.0'
      };

      const serializedValue = JSON.stringify(entry);
      const actualTTL = Math.floor(ttl || this.config.defaultTTL / 1000); // Convert to seconds

      await this.redis.setex(key, actualTTL, serializedValue);
      this.stats.sets++;
      this.updateHitRate();

      this.emit('set', { key, value, ttl: actualTTL });
      console.log(`[REDIS_CACHE] Set key: ${key} with TTL: ${actualTTL}s`);
    } catch (error) {
      this.stats.errors++;
      console.error(`[REDIS_CACHE] Failed to set key: ${key}`, error);
      throw error;
    }
  }

  // Get cache entry
  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const serializedValue = await this.redis.get(key);
      
      if (!serializedValue) {
        this.stats.misses++;
        this.updateHitRate();
        this.emit('miss', { key });
        return null;
      }

      const entry: RedisCacheEntry<T> = JSON.parse(serializedValue);
      
      // Check if entry has expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        await this.delete(key);
        this.stats.misses++;
        this.updateHitRate();
        this.emit('expired', { key });
        return null;
      }

      this.stats.hits++;
      this.updateHitRate();
      this.emit('hit', { key, value: entry.value });
      
      return entry.value;
    } catch (error) {
      this.stats.errors++;
      console.error(`[REDIS_CACHE] Failed to get key: ${key}`, error);
      throw error;
    }
  }

  // Delete cache entry
  async delete(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.redis.del(key);
      const deleted = result > 0;
      
      if (deleted) {
        this.stats.deletes++;
        this.emit('delete', { key });
        console.log(`[REDIS_CACHE] Deleted key: ${key}`);
      }

      return deleted;
    } catch (error) {
      this.stats.errors++;
      console.error(`[REDIS_CACHE] Failed to delete key: ${key}`, error);
      throw error;
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.redis.exists(key);
      return result > 0;
    } catch (error) {
      this.stats.errors++;
      console.error(`[REDIS_CACHE] Failed to check existence of key: ${key}`, error);
      throw error;
    }
  }

  // Set multiple cache entries
  async mset(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const pipeline = this.redis.pipeline();
      
      for (const { key, value, ttl } of entries) {
        const entry: RedisCacheEntry<any> = {
          value,
          timestamp: Date.now(),
          ttl: ttl || this.config.defaultTTL,
          version: '1.0'
        };

        const serializedValue = JSON.stringify(entry);
        const actualTTL = Math.floor((ttl || this.config.defaultTTL) / 1000);
        
        pipeline.setex(key, actualTTL, serializedValue);
      }

      await pipeline.exec();
      this.stats.sets += entries.length;
      this.updateHitRate();

      console.log(`[REDIS_CACHE] Set ${entries.length} keys in batch`);
    } catch (error) {
      this.stats.errors++;
      console.error('[REDIS_CACHE] Failed to set multiple keys', error);
      throw error;
    }
  }

  // Get multiple cache entries
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const serializedValues = await this.redis.mget(keys);
      const results: (T | null)[] = [];

      for (let i = 0; i < serializedValues.length; i++) {
        const serializedValue = serializedValues[i];
        const key = keys[i];

        if (!serializedValue) {
          results.push(null);
          this.stats.misses++;
          continue;
        }

        try {
          const entry: RedisCacheEntry<T> = JSON.parse(serializedValue);
          
          // Check if entry has expired
          if (Date.now() - entry.timestamp > entry.ttl) {
            await this.delete(key);
            results.push(null);
            this.stats.misses++;
            continue;
          }

          results.push(entry.value);
          this.stats.hits++;
        } catch (parseError) {
          console.error(`[REDIS_CACHE] Failed to parse value for key: ${key}`, parseError);
          results.push(null);
          this.stats.misses++;
        }
      }

      this.updateHitRate();
      return results;
    } catch (error) {
      this.stats.errors++;
      console.error('[REDIS_CACHE] Failed to get multiple keys', error);
      throw error;
    }
  }

  // Delete multiple cache entries
  async mdelete(keys: string[]): Promise<number> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.redis.del(...keys);
      this.stats.deletes += result;
      
      console.log(`[REDIS_CACHE] Deleted ${result} keys`);
      return result;
    } catch (error) {
      this.stats.errors++;
      console.error('[REDIS_CACHE] Failed to delete multiple keys', error);
      throw error;
    }
  }

  // Pattern-based cache invalidation
  async invalidatePattern(pattern: string): Promise<number> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }

      const result = await this.redis.del(...keys);
      this.stats.deletes += result;
      
      console.log(`[REDIS_CACHE] Invalidated ${result} keys matching pattern: ${pattern}`);
      return result;
    } catch (error) {
      this.stats.errors++;
      console.error(`[REDIS_CACHE] Failed to invalidate pattern: ${pattern}`, error);
      throw error;
    }
  }

  // Cache warming (pre-populate cache)
  async warmCache<T>(
    entries: Array<{ key: string; value: T; ttl?: number }>
  ): Promise<void> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      await this.mset(entries);
      console.log(`[REDIS_CACHE] Warmed cache with ${entries.length} entries`);
      this.emit('warmed', { count: entries.length });
    } catch (error) {
      console.error('[REDIS_CACHE] Failed to warm cache', error);
      throw error;
    }
  }

  // Get cache statistics
  async getStats(): Promise<RedisCacheStats> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      // Get Redis info
      const info = await this.redis.info();
      const memoryUsage = this.parseMemoryUsage(info);
      const connectedClients = this.parseConnectedClients(info);

      return {
        ...this.stats,
        memoryUsage,
        connectedClients
      };
    } catch (error) {
      console.error('[REDIS_CACHE] Failed to get statistics', error);
      return this.stats;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      await this.redis.ping();
      return true;
    } catch (error) {
      console.error('[REDIS_CACHE] Health check failed:', error);
      return false;
    }
  }

  // Flush all cache
  async flush(): Promise<void> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      await this.redis.flushdb();
      console.log('[REDIS_CACHE] Cache flushed');
      this.emit('flushed');
    } catch (error) {
      console.error('[REDIS_CACHE] Failed to flush cache', error);
      throw error;
    }
  }

  // Get cache keys matching pattern
  async keys(pattern: string): Promise<string[]> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      return await this.redis.keys(pattern);
    } catch (error) {
      console.error(`[REDIS_CACHE] Failed to get keys for pattern: ${pattern}`, error);
      throw error;
    }
  }

  // Get cache size
  async size(): Promise<number> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const keys = await this.redis.keys('*');
      return keys.length;
    } catch (error) {
      console.error('[REDIS_CACHE] Failed to get cache size', error);
      throw error;
    }
  }

  // Update hit rate
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  // Parse memory usage from Redis info
  private parseMemoryUsage(info: string): number {
    const memoryMatch = info.match(/used_memory_human:(\d+\.?\d*)([KMGT]?)/);
    if (memoryMatch) {
      const value = parseFloat(memoryMatch[1]);
      const unit = memoryMatch[2];
      const multipliers = { 'K': 1024, 'M': 1024 * 1024, 'G': 1024 * 1024 * 1024, 'T': 1024 * 1024 * 1024 * 1024 };
      return value * (multipliers[unit as keyof typeof multipliers] || 1);
    }
    return 0;
  }

  // Parse connected clients from Redis info
  private parseConnectedClients(info: string): number {
    const clientsMatch = info.match(/connected_clients:(\d+)/);
    return clientsMatch ? parseInt(clientsMatch[1]) : 0;
  }

  // Close Redis connection
  async close(): Promise<void> {
    try {
      await this.redis.quit();
      console.log('[REDIS_CACHE] Redis connection closed');
    } catch (error) {
      console.error('[REDIS_CACHE] Failed to close Redis connection', error);
      throw error;
    }
  }

  // Reset statistics
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      hitRate: 0,
      memoryUsage: 0,
      connectedClients: 0
    };
  }
}

// Export singleton instance
export const redisCacheService = RedisCacheService.getInstance();
