"""
智能学习助手 v6.0 - FastAPI 版
API 路由模块：将原 Flask Blueprint 迁移到 FastAPI APIRouter
"""

import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse

from models import db, LearningSession
from services.ai_service import generate_ai_response


router = APIRouter()


# ---------------- 健康检查 ----------------


@router.get("/health")
async def health_check():
    """返回 API 运行状态"""
    return {
        "success": True,
        "message": "智能学习助手 API 正常运行 (FastAPI 版)",
        "version": "6.0-fastapi",
        "timestamp": datetime.now().isoformat(),
    }


# ---------------- 学习会话 ----------------


@router.post("/start-learning", status_code=status.HTTP_201_CREATED)
async def start_learning(request: Request):
    """创建新的学习会话"""
    data = await request.json()
    topic = (data.get("topic") or "").strip()
    mode = data.get("mode", "basic")

    if not topic:
        raise HTTPException(status_code=400, detail="学习主题不能为空白")

    try:
        session = LearningSession(topic, mode)
        db.session.add(session)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise HTTPException(status_code=500, detail=f"数据库错误: {e}")

    return {
        "success": True,
        "message": f"成功启动 \"{topic}\" 学习会话",
        "session": session.to_dict(),
    }


# ---------------- 会话信息 ----------------


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    session = db.session.query(LearningSession).filter_by(session_id=session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="找不到这个会话")
    return {"success": True, "session": session.to_dict()}


# ---------------- 生成课题文件 ----------------


@router.post("/generate-course")
async def generate_course(request: Request):
    data = await request.json()
    session_id = data.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="需要提供会话ID")

    session = db.session.query(LearningSession).filter_by(session_id=session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="找不到这个会话")

    try:
        content = f"""# {session.topic} - 学习课题

## 课题概览
- **主题**: {session.topic}
- **学习模式**: {session.mode}
- **创建时间**: {session.created_at}
- **当前进度**: {session.progress}%

## 学习任务
"""
        tasks = json.loads(session.tasks)
        for i, task in enumerate(tasks, 1):
            status_emoji = '🔄' if task.get('status') == 'current' else '⏳'
            content += f"""
### {i}. {task['title']} {status_emoji}
- **难度**: {'⭐' * task.get('difficulty', 1)}
- **预估时间**: {task.get('estimated_time', 'N/A')}
- **描述**: {task.get('description', '')}
"""
        content += f"""
## 学习记录 (聊天历史)
"""
        chat_history = session.get_chat_history()
        for msg in chat_history:
            role = "👤 用户" if msg['type'] == 'user' else "🤖 AI助手"
            content += f"""
**{role}** ({msg.get('timestamp', '')})
> {msg.get('content', '')}
"""
        filename = f"{session.topic}_学习课题_{datetime.now().strftime('%Y%m%d')}.md"
        
        return {
            'success': True,
            'content': content,
            'filename': filename,
            'message': '课题文件生成成功'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成课题文件失败: {e}") 