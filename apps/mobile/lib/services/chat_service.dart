import 'connectivity.dart';
import 'package:flutter/foundation.dart';

class ChatConversation {
  final String id;
  final String? name;
  final String lastMessage;
  final String timestamp;
  final List<String> memberNames;

  ChatConversation({
    required this.id,
    this.name,
    required this.lastMessage,
    required this.timestamp,
    required this.memberNames,
  });

  factory ChatConversation.fromJson(Map<String, dynamic> json) {
    final members = (json['members'] as List).map((m) => '${m['user']['firstName']} ${m['user']['lastName']}').toList();
    final lastMsg = (json['messages'] as List).isNotEmpty ? json['messages'][0]['content'] : 'No messages yet';
    return ChatConversation(
      id: json['id'],
      name: json['name'],
      lastMessage: lastMsg,
      timestamp: json['createdAt'],
      memberNames: members,
    );
  }
}

class ChatMessage {
  final String id;
  final String content;
  final String senderId;
  final String senderName;
  final String timestamp;

  ChatMessage({
    required this.id,
    required this.content,
    required this.senderId,
    required this.senderName,
    required this.timestamp,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) => ChatMessage(
    id: json['id'],
    content: json['content'],
    senderId: json['senderId'],
    senderName: '${json['sender']['firstName']} ${json['sender']['lastName']}',
    timestamp: json['timestamp'],
  );
}

class ChatService {
  final NetworkRouter _router = NetworkRouter();

  Future<List<ChatConversation>> getConversations() async {
    try {
      final response = await _router.get('/api/trpc/internalChat.getConversations?batch=1');
      if (response != null && response is List && response.isNotEmpty) {
        final items = response[0]['result']['data'] as List;
        return items.map((i) => ChatConversation.fromJson(i)).toList();
      }
      return [];
    } catch (e) {
      debugPrint('[ChatService] Error: $e');
      return [];
    }
  }

  Future<List<ChatMessage>> getMessages(String groupId) async {
    try {
      final response = await _router.get(
        '/api/trpc/internalChat.getMessages?batch=1&input=${Uri.encodeComponent('{"0":{"groupId":"$groupId"}}')}',
      );
      if (response != null && response is List && response.isNotEmpty) {
        final items = response[0]['result']['data']['messages'] as List;
        return items.map((i) => ChatMessage.fromJson(i)).toList();
      }
      return [];
    } catch (e) {
      debugPrint('[ChatService] Error: $e');
      return [];
    }
  }

  Future<void> sendMessage(String groupId, String content) async {
    try {
      await _router.post(
        '/api/trpc/internalChat.sendMessage?batch=1',
        body: {
          "0": {
            "groupId": groupId,
            "content": content
          }
        },
      );
    } catch (e) {
      debugPrint('[ChatService] Error: $e');
    }
  }
}
