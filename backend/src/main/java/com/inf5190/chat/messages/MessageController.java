package com.inf5190.chat.messages;

import com.inf5190.chat.messages.model.Message;
import com.inf5190.chat.messages.model.NewMessageRequest;
import com.inf5190.chat.messages.repository.MessageRepository;
import com.inf5190.chat.websocket.WebSocketManager;
import java.util.List;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur qui gère l'API de messages.
 */
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RestController
public class MessageController {

    public static final String MESSAGES_PATH = "/messages";

    private final MessageRepository messageRepository;
    private final WebSocketManager webSocketManager;

    public MessageController(
        MessageRepository messageRepository,
        WebSocketManager webSocketManager
    ) {
        this.messageRepository = messageRepository;
        this.webSocketManager = webSocketManager;
    }

    @GetMapping(MESSAGES_PATH)
    public List<Message> getMessages(
        @RequestParam(value = "fromId", required = false) Long fromId
    ) {
        return messageRepository.getMessages(fromId);
    }

    @PostMapping(MESSAGES_PATH)
    public Message createMessage(@RequestBody NewMessageRequest message) {
        Message newMessage = messageRepository.createMessage(message);
        webSocketManager.notifySessions();
        return newMessage;
    }
}
