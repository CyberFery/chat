package com.inf5190.chat.messages;

import com.inf5190.chat.auth.AuthController;
import com.inf5190.chat.messages.model.Message;
import com.inf5190.chat.messages.model.NewMessageRequest;
import com.inf5190.chat.messages.repository.MessageRepository;
import com.inf5190.chat.websocket.WebSocketManager;
import java.util.List;
import java.util.concurrent.ExecutionException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RestController
public class MessageController {

    public static final String MESSAGES_PATH = "/messages";

    private final MessageRepository messageRepository;
    private final WebSocketManager webSocketManager;

    private final Logger LOGGER = LoggerFactory.getLogger(MessageController.class);

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
    ) throws ResponseStatusException {
        try {
            return messageRepository.getMessages(fromId);
        } catch (ExecutionException | InterruptedException e) {
            LOGGER.warn("Erreur dans Firestore.", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unexpected error on get message.");
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Message not found"
            );
        } catch (Exception e) {
            LOGGER.warn("Erreur inattendue.", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unexpected error on get message.");
        }
    }

    @PostMapping(MESSAGES_PATH)
    @ResponseStatus(HttpStatus.CREATED)
    public Message createMessage(
        @RequestBody NewMessageRequest message,
        @RequestHeader("username") String username
    ) throws ResponseStatusException {
        try {
            if (!username.equals(message.username())) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Username mismatch"
                );
            }

            Message newMessage = messageRepository.createMessage(message);
            webSocketManager.notifySessions();
            return newMessage;
        } catch (ExecutionException | InterruptedException e) {
            LOGGER.warn("Erreur dans Firestore.", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unexpected error on create message.");
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            LOGGER.warn("Erreur inattendue.", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unexpected error on create message.");
        }
    }
}
