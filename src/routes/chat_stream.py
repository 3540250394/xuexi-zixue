from flask import Blueprint, Response, request, stream_with_context, jsonify
import json
import time

stream_bp = Blueprint('chat_stream', __name__)

@stream_bp.route('/chat', methods=['POST'])
def chat_stream():
    """流式聊天接口 (SSE) - DEMO 逐字返回"""
    data = request.get_json() or {}
    messages = data.get('messages', [])
    if not messages:
        return jsonify({'error': 'messages required'}), 400

    user_msg = messages[-1].get('content', '') if isinstance(messages[-1], dict) else ''
    if not user_msg:
        return jsonify({'error': 'last message empty'}), 400

    def event_stream():
        assistant_reply = f"你刚才说: {user_msg}. 这里是流式回复示例。"
        for ch in assistant_reply:
            yield f"data: {json.dumps({'role':'assistant','content': ch})}\n\n"
            time.sleep(0.05)
        # 示例工具推荐
        tool_payload = {
            'tool': 'generate_plan',
            'label': '生成学习计划',
            'args': {'topic': user_msg}
        }
        yield f"data: {json.dumps(tool_payload)}\n\n"
        yield "data: [DONE]\n\n"
    headers = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no'
    }
    return Response(stream_with_context(event_stream()), headers=headers) 