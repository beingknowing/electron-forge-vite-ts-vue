import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// 基础配置数据类型
export interface ConfigData {
  [key: string]: string | number | boolean;
}

// 配置数组类型 - 支持持久化
export interface ConfigArray {
  id?: string;
  name?: string;
  data: ConfigData[];
  created_at?: string;
  updated_at?: string;
}

// 加密配置类型
interface EncryptedConfig {
  data: string;
  iv: string;
  algorithm: string;
  salt: string; // 添加盐值提高安全性
}

// 持久化存储选项
interface PersistenceOptions {
  backupEnabled?: boolean; // 是否启用备份
  maxBackups?: number; // 最大备份数量
  compression?: boolean; // 是否压缩（预留）
}

/**
 * ConfigArray 持久化管理器
 * 专门用于 ConfigArray 类型的存储、读取、备份和恢复
 */
export class ConfigArrayPersistence {
  private storagePath: string;
  private backupPath: string;
  private masterKey: string;
  private options: Required<PersistenceOptions>;

  constructor(options?: PersistenceOptions) {
    const userDataPath = app.getPath('userData');
    this.storagePath = path.join(userDataPath, 'config-arrays');
    this.backupPath = path.join(userDataPath, 'config-arrays-backup');
    this.masterKey = process.env.CONFIG_MASTER_KEY || 'default-dev-key-change-in-production';

    // 默认选项
    this.options = {
      backupEnabled: options?.backupEnabled ?? true,
      maxBackups: options?.maxBackups ?? 5,
      compression: options?.compression ?? false
    };

    this.ensureStorageDirs();
  }

  /**
   * 确保存储目录存在
   */
  private ensureStorageDirs(): void {
    [this.storagePath, this.backupPath].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * 生成存储文件名
   */
  private getStorageFileName(name: string): string {
    // 清理文件名，移除非法字符
    const cleanName = name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    return `${cleanName}.json`;
  }

  /**
   * 存储 ConfigArray（持久化）
   */
  public saveConfigArray(configArray: ConfigArray, name?: string): void {
    console.log("🚀 ~ ConfigArrayPersistence ~ saveConfigArray ~ configArray:", configArray)
    try {
      const arrayName = name || configArray.name || configArray.id || `array_${Date.now()}`;
      const fileName = this.getStorageFileName(arrayName);
      const filePath = path.join(this.storagePath, fileName);

      // 添加时间戳
      const dataToSave: ConfigArray = {
        created_at: new Date().toISOString(),
        ...configArray,
        updated_at: new Date().toISOString(),
      };
      console.log("🚀 ~ ConfigArrayPersistence ~ saveConfigArray ~ dataToSave:", dataToSave)

      // 备份现有文件（如果存在）
      this.backupExistingFile(filePath);

      // 写入文件
      fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
      console.log(`✅ ConfigArray saved: ${arrayName} (${configArray.data.length} items) -> ${fileName}`);
    } catch (error) {
      console.error('❌ Failed to save ConfigArray:', error);
      throw error;
    }
  }

  /**
   * 读取 ConfigArray（持久化）
   */
  public loadConfigArray(name: string): ConfigArray | undefined {
    try {
      const fileName = this.getStorageFileName(name);
      const filePath = path.join(this.storagePath, fileName);

      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ ConfigArray not found: ${name}`);
        return undefined;
      }

      const data = fs.readFileSync(filePath, 'utf8');
      const configArray = JSON.parse(data) as ConfigArray;

      // 验证数据结构
      if (!this.isValidConfigArray(configArray)) {
        console.error(`❌ Invalid ConfigArray structure: ${name}`);
        return undefined;
      }

      console.log(`✅ ConfigArray loaded: ${name} (${configArray.data.length} items)`);
      return configArray;
    } catch (error) {
      console.error(`❌ Failed to load ConfigArray ${name}:`, error);
      return undefined;
    }
  }

  /**
   * 验证 ConfigArray 结构
   */
  private isValidConfigArray(data: any): data is ConfigArray {
    return (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.data) &&
      data.data.every(item => typeof item === 'object' && item !== null)
    );
  }

  /**
   * 备份现有文件
   */
  private backupExistingFile(filePath: string): void {
    if (!this.options.backupEnabled || !fs.existsSync(filePath)) {
      return;
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = path.basename(filePath);
      const backupFileName = `${path.parse(fileName).name}_${timestamp}${path.parse(fileName).ext}`;
      const backupFilePath = path.join(this.backupPath, backupFileName);

      fs.copyFileSync(filePath, backupFilePath);
      console.log(`💾 Backup created: ${backupFileName}`);

      // 清理旧备份
      this.cleanupOldBackups(path.parse(fileName).name);
    } catch (error) {
      console.error('❌ Failed to create backup:', error);
    }
  }

  /**
   * 清理旧备份文件
   */
  private cleanupOldBackups(baseName: string): void {
    try {
      const backupFiles = fs.readdirSync(this.backupPath)
        .filter(file => file.startsWith(baseName))
        .sort()
        .reverse(); // 最新的在前

      if (backupFiles.length > this.options.maxBackups) {
        const filesToDelete = backupFiles.slice(this.options.maxBackups);
        filesToDelete.forEach(file => {
          fs.unlinkSync(path.join(this.backupPath, file));
          console.log(`🗑️ Old backup removed: ${file}`);
        });
      }
    } catch (error) {
      console.error('❌ Failed to cleanup old backups:', error);
    }
  }

  /**
   * 列出所有存储的 ConfigArray
   */
  public listStoredArrays(): Array<{ name: string; itemCount: number; updatedAt: string }> {
    try {
      const files = fs.readdirSync(this.storagePath)
        .filter(file => file.endsWith('.json'));

      return files.map(file => {
        try {
          const filePath = path.join(this.storagePath, file);
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          return {
            name: path.parse(file).name,
            itemCount: Array.isArray(data.data) ? data.data.length : 0,
            updatedAt: data.updated_at || data.created_at || 'unknown'
          };
        } catch {
          return {
            name: path.parse(file).name,
            itemCount: 0,
            updatedAt: 'corrupted'
          };
        }
      });
    } catch (error) {
      console.error('❌ Failed to list stored arrays:', error);
      return [];
    }
  }

  /**
   * 删除存储的 ConfigArray
   */
  public deleteConfigArray(name: string): boolean {
    try {
      const fileName = this.getStorageFileName(name);
      const filePath = path.join(this.storagePath, fileName);

      if (fs.existsSync(filePath)) {
        // 备份后删除
        this.backupExistingFile(filePath);
        fs.unlinkSync(filePath);
        console.log(`🗑️ ConfigArray deleted: ${name}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`❌ Failed to delete ConfigArray ${name}:`, error);
      return false;
    }
  }

  /**
   * 恢复备份版本
   */
  public restoreFromBackup(backupFileName: string): boolean {
    try {
      const backupFilePath = path.join(this.backupPath, backupFileName);

      if (!fs.existsSync(backupFilePath)) {
        console.error(`❌ Backup file not found: ${backupFileName}`);
        return false;
      }

      const fileName = path.basename(backupFileName).replace(/_\d{4}-\d{2}-\d{2}T.*/, '.json');
      const targetPath = path.join(this.storagePath, fileName);

      fs.copyFileSync(backupFilePath, targetPath);
      console.log(`✅ Restored from backup: ${backupFileName} -> ${fileName}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to restore from backup ${backupFileName}:`, error);
      return false;
    }
  }

  /**
   * 加密存储 ConfigArray
   */
  public saveEncryptedConfigArray(configArray: ConfigArray, name?: string): void {
    try {
      const arrayName = name || configArray.name || configArray.id || `encrypted_array_${Date.now()}`;
      const fileName = this.getStorageFileName(`${arrayName}_encrypted`);
      const filePath = path.join(this.storagePath, fileName);

      // 生成随机盐值
      const salt = crypto.randomBytes(16).toString('hex');
      const key = crypto.scryptSync(this.masterKey, salt, 32);
      const iv = crypto.randomBytes(16);

      const dataToEncrypt = JSON.stringify({
        ...configArray,
        updated_at: new Date().toISOString(),
        created_at: configArray.created_at || new Date().toISOString()
      });

      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
      let encrypted = cipher.update(dataToEncrypt, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const encryptedConfig: EncryptedConfig = {
        data: encrypted,
        iv: iv.toString('hex'),
        algorithm: 'aes-256-gcm',
        salt
      };

      // 备份现有文件
      this.backupExistingFile(filePath);

      fs.writeFileSync(filePath, JSON.stringify(encryptedConfig, null, 2));
      console.log(`🔒 Encrypted ConfigArray saved: ${arrayName}`);
    } catch (error) {
      console.error('❌ Failed to save encrypted ConfigArray:', error);
      throw error;
    }
  }

  /**
   * 读取加密的 ConfigArray
   */
  public loadEncryptedConfigArray(name: string): ConfigArray | undefined {
    try {
      const fileName = this.getStorageFileName(`${name}_encrypted`);
      const filePath = path.join(this.storagePath, fileName);

      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ Encrypted ConfigArray not found: ${name}`);
        return undefined;
      }

      const data = fs.readFileSync(filePath, 'utf8');
      const encryptedConfig = JSON.parse(data) as EncryptedConfig;

      const key = crypto.scryptSync(this.masterKey, encryptedConfig.salt, 32);
      const iv = Buffer.from(encryptedConfig.iv, 'hex');

      const decipher = crypto.createDecipheriv(encryptedConfig.algorithm, key, iv);
      let decrypted = decipher.update(encryptedConfig.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      const configArray = JSON.parse(decrypted) as ConfigArray;

      if (!this.isValidConfigArray(configArray)) {
        console.error(`❌ Invalid encrypted ConfigArray structure: ${name}`);
        return undefined;
      }

      console.log(`🔓 Encrypted ConfigArray loaded: ${name} (${configArray.data.length} items)`);
      return configArray;
    } catch (error) {
      console.error(`❌ Failed to load encrypted ConfigArray ${name}:`, error);
      return undefined;
    }
  }
}

// 单例实例
export const configArrayPersistence = new ConfigArrayPersistence({
  backupEnabled: true,
  maxBackups: 5,
  compression: false
});

// 便捷函数
export const saveConfigArray = (configArray: ConfigArray, name?: string) => configArrayPersistence.saveConfigArray(configArray, name);
export const loadConfigArray = (name: string) => configArrayPersistence.loadConfigArray(name);
export const listStoredArrays = () => configArrayPersistence.listStoredArrays();
export const deleteConfigArray = (name: string) => configArrayPersistence.deleteConfigArray(name);
export const saveEncryptedConfigArray = (configArray: ConfigArray, name?: string) => configArrayPersistence.saveEncryptedConfigArray(configArray, name);
export const loadEncryptedConfigArray = (name: string) => configArrayPersistence.loadEncryptedConfigArray(name);
export const restoreFromBackup = (backupFileName: string) => configArrayPersistence.restoreFromBackup(backupFileName);