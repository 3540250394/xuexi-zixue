#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能学习助手 v5.0 - 野猫思维版
AI服务模块 - 和外部AI模型打交道的地方
"""
import requests
import time
import os

from config import API_KEY, API_URL, MODEL_ID
from models import db, LearningSession

# 一些基本的API常量
TIMEOUT = 60.0
MAX_RETRIES = 3

def generate_ai_response(message: str, session_id: str = None) -> str:
    """
    野猫式AI回复生成:
    1. 准备好要说的话 (prompt)
    2. 发送给AI
    3. 把AI的回复原样返回
    别搞复杂了.
    """
    
    # 准备请求头和请求体
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }
    
    # 构建输入消息
    messages = [
        {'role': 'system', 'content': '你是一个专业的AI学习助手，帮助用户学习新知识。请用中文回答。'}
    ]
    
    # 如果有会话ID，加载聊天记录作为上下文
    if session_id:
        session = db.session.get(LearningSession, session_id)
        if session:
            messages[0]['content'] += f" 当前的学习主题是'{session.topic}'。"
            # 只采用最近6条对话作为上下文
            chat_history = session.get_chat_history()[-6:]
            for chat in chat_history:
                messages.append({
                    'role': chat['type'],
                    'content': chat['content']
                })

    messages.append({'role': 'user', 'content': message})

    payload = {
        'model': MODEL_ID,
        'messages': messages,
        'max_tokens': 2048,
        'temperature': 0.7,
        'stream': False
    }

    # 发送请求并处理重试
    for i in range(MAX_RETRIES):
        try:
            response = requests.post(API_URL, headers=headers, json=payload, timeout=TIMEOUT)
            response.raise_for_status()  # 如果请求失败则抛出HTTPError
            
            # 解析响应
            data = response.json()
            ai_message = data['choices'][0]['message']['content']
            return ai_message.strip()

        except requests.exceptions.RequestException as e:
            print(f"❌ 请求API失败 (尝试 {i+1}/{MAX_RETRIES}): {e}")
            if i < MAX_RETRIES - 1:
                time.sleep(2 ** i)  # 指数退避
            else:
                return "抱歉，AI服务当前不可用，请稍后再试。"
    
    return "抱歉，AI服务当前似乎遇到了问题。" 