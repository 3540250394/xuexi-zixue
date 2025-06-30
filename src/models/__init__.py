from flask_sqlalchemy import SQLAlchemy
from config import DB_PATH

db = SQLAlchemy()

def init_db(app):
    app.config['SQLALCHEMY_DATABASE_URI'] = DB_PATH
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    
    with app.app_context():
        db.create_all()
        
    return db

# 导入所有模型
from .session import LearningSession 