package com.inf5190.chat.messages.repository;

import com.inf5190.chat.messages.model.Message;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;
import org.springframework.stereotype.Repository;

/**
 * Classe qui gère la persistence des messages.
 *
 * En mémoire pour le moment.
 */
@Repository
public class MessageRepository {

    private final List<Message> messages = new ArrayList<>();
    private final AtomicLong idGenerator = new AtomicLong(0);

    public List<Message> getMessages(Long fromId) {
        if (fromId == null) {
            return new ArrayList<>(messages);
        } else {
            return messages
                .stream()
                .filter(message -> message.id() > fromId)
                .collect(Collectors.toList());
        }
    }

    public Message createMessage(Message message) {
        long id = idGenerator.incrementAndGet();
        long timestamp = System.currentTimeMillis();
        Message newMessage = new Message(
            id,
            message.username(),
            timestamp,
            message.text()
        );
        messages.add(newMessage);
        return newMessage;
    }
}
