from datetime import datetime
import uuid
import json
from . import db

class LearningSession(db.Model):
    __tablename__ = 'learning_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4()))
    topic = db.Column(db.String(255), nullable=False)
    mode = db.Column(db.String(50), default='basic')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    progress = db.Column(db.Integer, default=0)
    current_task_id = db.Column(db.Integer, default=1)
    tasks = db.Column(db.Text)  # JSON存储
    chat_history = db.Column(db.Text)  # JSON存储
    
    def __init__(self, topic, mode='basic'):
        self.topic = topic
        self.mode = mode
        self.tasks = json.dumps(self.generate_tasks())
        self.chat_history = json.dumps([
            {
                'type': 'assistant',
                'content': f'欢迎开始学习"{topic}"！我是你的AI学习助手，有任何问题都可以问我。',
                'timestamp': datetime.now().isoformat()
            }
        ])
    
    def generate_tasks(self):
        """根据主题和模式生成学习任务"""
        # 与原代码相同的任务生成逻辑
        base_tasks = [
            {
                'id': 1,
                'title': f'{self.topic}基础概念',
                'description': f'了解{self.topic}的基本概念和定义',
                'difficulty': 1,
                'estimated_time': '30分钟',
                'status': 'current',
                'examples': [f'{self.topic}的基本定义', '核心概念解释'],
                'tips': ['从基础开始', '理解核心概念']
            },
            # ... 其他任务
        ]
        
        # 根据模式调整任务
        if self.mode == 'quick':
            return base_tasks[:3]
        elif self.mode == 'deep':
            for task in base_tasks:
                task['estimated_time'] = str(int(task['estimated_time'].split('分')[0]) * 1.5) + '分钟'
        
        return base_tasks
    
    def get_chat_history(self):
        """从JSON文本加载聊天记录"""
        return json.loads(self.chat_history or '[]')

    def add_chat_message(self, message: dict):
        """添加一条新的聊天消息"""
        history = self.get_chat_history()
        history.append(message)
        self.chat_history = json.dumps(history)

    def to_dict(self):
        return {
            'session_id': self.session_id,
            'topic': self.topic,
            'mode': self.mode,
            'created_at': self.created_at.isoformat(),
            'progress': self.progress,
            'current_task_id': self.current_task_id,
            'tasks': json.loads(self.tasks),
            'chat_history': json.loads(self.chat_history)
        } 