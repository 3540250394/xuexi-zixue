#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能学习助手 v5.0 - 野猫思维版
配置管理模块 - 简单直接，无花哨
"""

import os
from pathlib import Path

# 尝试导入dotenv，如果没有就算了，用默认值
try:
    from dotenv import load_dotenv
    # 加载.env文件
    env_path = Path(__file__).parent.parent.parent / '.env'
    load_dotenv(env_path)
    print("✅ 已加载环境变量")
except ImportError:
    print("⚠️ 未找到python-dotenv，使用默认配置")
    print("💡 提示: pip install python-dotenv")

# API配置
API_URL = os.getenv("API_URL", "https://duck2api.com/v1/chat/completions")
API_KEY = os.getenv("API_KEY", "sk-r4cqnvCSUUDGBVLOd1rVvMitbmpeVUKE3UF6C0747msQ6wAU")
MODEL_ID = os.getenv("MODEL_ID", "claude-3-5-sonnet-20241022")

# 服务器配置
DEBUG = os.getenv("DEBUG", "True").lower() in ('true', '1', 't', 'yes')
PORT = int(os.getenv("PORT", "5001"))
HOST = os.getenv("HOST", "0.0.0.0")

# 数据库配置 - 默认使用SQLite（简单够用）
DB_TYPE = os.getenv("DB_TYPE", "sqlite")
DB_PATH = os.getenv("DB_PATH", "sqlite:///app.db")

# 安全配置
SECRET_KEY = os.getenv("SECRET_KEY", os.urandom(24).hex())

# 日志配置
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

def validate_config():
    """验证配置是否有效"""
    if not API_KEY:
        print("⚠️ 警告: API_KEY 未设置")
    if not API_URL:
        print("⚠️ 警告: API_URL 未设置")
    if not MODEL_ID:
        print("⚠️ 警告: MODEL_ID 未设置")

# 导出配置字典 - 方便一次性获取所有配置
CONFIG = {
    "API_URL": API_URL,
    "API_KEY": API_KEY,
    "MODEL_ID": MODEL_ID,
    "DEBUG": DEBUG,
    "PORT": PORT,
    "HOST": HOST,
    "DB_TYPE": DB_TYPE,
    "DB_PATH": DB_PATH,
    "SECRET_KEY": SECRET_KEY,
    "LOG_LEVEL": LOG_LEVEL
}

# 当直接运行此文件时，执行配置检查
if __name__ == "__main__":
    print("🐱 野猫思维配置检查工具")
    validate_config()
    
    print("\n当前配置:")
    for key, value in CONFIG.items():
        # 不显示敏感信息
        if key in ["API_KEY", "SECRET_KEY"]:
            value = f"{value[:5]}..." if value else "未设置"
        print(f"{key}: {value}") 