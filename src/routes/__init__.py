def register_routes(app):
    """
    野猫式路由注册:
    把所有API蓝图扔这里就行
    """
    from .api import bp as api_blueprint
    
    app.register_blueprint(api_blueprint, url_prefix='/api')
    print("✅ API路由注册完成") 