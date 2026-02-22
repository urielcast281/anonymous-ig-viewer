const fs = require('fs').promises;
const path = require('path');
const config = require('../config');

class CacheService {
  constructor() {
    this.cacheDir = path.join(__dirname, '../cache');
    this.memoryCache = new Map();
    this.initCache();
  }

  async initCache() {
    try {
      await fs.access(this.cacheDir);
    } catch {
      await fs.mkdir(this.cacheDir, { recursive: true });
    }
  }

  // Generate cache key from data
  generateKey(type, identifier) {
    return `${type}_${identifier.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  }

  // Get cache file path
  getCacheFilePath(key) {
    return path.join(this.cacheDir, `${key}.json`);
  }

  // Check if cache is valid
  isValidCache(cacheData, ttl) {
    if (!cacheData || !cacheData.timestamp) return false;
    const now = Date.now();
    const cacheAge = now - cacheData.timestamp;
    return cacheAge < (ttl * 1000); // TTL is in seconds
  }

  // Get from memory cache first, then file cache
  async get(type, identifier) {
    const key = this.generateKey(type, identifier);
    const ttl = config.CACHE_TTL[type.toUpperCase()] || 3600;

    // Check memory cache first
    if (this.memoryCache.has(key)) {
      const memData = this.memoryCache.get(key);
      if (this.isValidCache(memData, ttl)) {
        return memData.data;
      } else {
        this.memoryCache.delete(key);
      }
    }

    // Check file cache
    try {
      const filePath = this.getCacheFilePath(key);
      const fileData = await fs.readFile(filePath, 'utf8');
      const cacheData = JSON.parse(fileData);
      
      if (this.isValidCache(cacheData, ttl)) {
        // Store in memory cache for faster access
        this.memoryCache.set(key, cacheData);
        return cacheData.data;
      } else {
        // Cache expired, delete file
        await this.delete(type, identifier);
        return null;
      }
    } catch (error) {
      // File doesn't exist or is corrupted
      return null;
    }
  }

  // Set cache (both memory and file)
  async set(type, identifier, data) {
    const key = this.generateKey(type, identifier);
    const cacheData = {
      timestamp: Date.now(),
      type,
      identifier,
      data
    };

    // Store in memory cache
    this.memoryCache.set(key, cacheData);

    // Store in file cache
    try {
      const filePath = this.getCacheFilePath(key);
      await fs.writeFile(filePath, JSON.stringify(cacheData, null, 2));
      return true;
    } catch (error) {
      console.error('Cache write error:', error);
      return false;
    }
  }

  // Delete cache entry
  async delete(type, identifier) {
    const key = this.generateKey(type, identifier);
    
    // Remove from memory cache
    this.memoryCache.delete(key);
    
    // Remove from file cache
    try {
      const filePath = this.getCacheFilePath(key);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      // File might not exist, that's okay
      return true;
    }
  }

  // Clear all cache of a specific type
  async clearType(type) {
    const files = await fs.readdir(this.cacheDir);
    const typePrefix = `${type.toLowerCase()}_`;
    
    const deletePromises = files
      .filter(file => file.startsWith(typePrefix))
      .map(file => fs.unlink(path.join(this.cacheDir, file)));
    
    // Clear from memory cache too
    for (const [key] of this.memoryCache) {
      if (key.startsWith(typePrefix)) {
        this.memoryCache.delete(key);
      }
    }
    
    await Promise.all(deletePromises);
    return true;
  }

  // Clear all cache
  async clearAll() {
    this.memoryCache.clear();
    
    try {
      const files = await fs.readdir(this.cacheDir);
      const deletePromises = files.map(file => 
        fs.unlink(path.join(this.cacheDir, file))
      );
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  // Get cache stats
  async getStats() {
    try {
      const files = await fs.readdir(this.cacheDir);
      const stats = {
        memoryEntries: this.memoryCache.size,
        fileEntries: files.length,
        types: {}
      };

      for (const file of files) {
        if (file.endsWith('.json')) {
          const type = file.split('_')[0];
          stats.types[type] = (stats.types[type] || 0) + 1;
        }
      }

      return stats;
    } catch (error) {
      return { memoryEntries: this.memoryCache.size, fileEntries: 0, types: {} };
    }
  }

  // Cleanup expired cache entries (run periodically)
  async cleanup() {
    console.log('🧹 Starting cache cleanup...');
    let cleaned = 0;
    
    try {
      const files = await fs.readdir(this.cacheDir);
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        try {
          const filePath = path.join(this.cacheDir, file);
          const fileData = await fs.readFile(filePath, 'utf8');
          const cacheData = JSON.parse(fileData);
          
          const type = cacheData.type || file.split('_')[0];
          const ttl = config.CACHE_TTL[type.toUpperCase()] || 3600;
          
          if (!this.isValidCache(cacheData, ttl)) {
            await fs.unlink(filePath);
            cleaned++;
          }
        } catch (error) {
          // If file is corrupted, delete it
          await fs.unlink(path.join(this.cacheDir, file));
          cleaned++;
        }
      }
      
      console.log(`🧹 Cache cleanup completed. Removed ${cleaned} expired entries.`);
      return cleaned;
    } catch (error) {
      console.error('Cache cleanup error:', error);
      return 0;
    }
  }
}

module.exports = new CacheService();