 

// 加密配置类型
interface EncryptedConfig {
  data: string;
  iv: string;
  algorithm: string;
  salt: string; // 添加盐值提高安全性
}

