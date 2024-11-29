package com.inf5190.chat.messages;

import com.inf5190.chat.messages.model.Message;
import com.inf5190.chat.messages.model.NewMessageRequest;
import com.inf5190.chat.messages.repository.MessageRepository;
import com.inf5190.chat.websocket.WebSocketManager;
import java.util.List;
import java.util.concurrent.ExecutionException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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
        @RequestParam(value = "fromId", required = false) String fromId
    ) throws ExecutionException, InterruptedException {
        try {
            return messageRepository.getMessages(fromId);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Message not found"
            );
        }
    }

    @PostMapping(MESSAGES_PATH)
    @ResponseStatus(HttpStatus.CREATED)
    public Message createMessage(
        @RequestBody NewMessageRequest message,
        @RequestHeader("username") String username
    ) throws ExecutionException, InterruptedException {
        if (!username.equals(message.username())) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Username mismatch"
            );
        }
        Message newMessage = messageRepository.createMessage(message);
        webSocketManager.notifySessions();
        return newMessage;
    }
}
