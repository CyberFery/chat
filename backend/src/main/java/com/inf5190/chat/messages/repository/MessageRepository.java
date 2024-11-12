package com.inf5190.chat.messages.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteResult;
import com.google.firebase.cloud.FirestoreClient;
import com.inf5190.chat.messages.model.Message;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

import com.inf5190.chat.messages.model.NewMessageRequest;
import java.util.concurrent.ExecutionException;
import java.util.logging.Logger;
import org.springframework.stereotype.Repository;

@Repository
public class MessageRepository {

    private static final String COLLECTION_NAME = "messages";
    private final Firestore firestore = FirestoreClient.getFirestore();
    private static final Logger logger = Logger.getLogger(
        MessageRepository.class.getName()
    );

    public Message createMessage(Message message)
        throws ExecutionException, InterruptedException {
        CollectionReference messagesCollection = firestore.collection(
            COLLECTION_NAME
        );

        DocumentReference docRef = messagesCollection.document();

        FirestoreMessage firestoreMessage = new FirestoreMessage(
            message.username(),
            Timestamp.now(),
            message.text()
        );

        ApiFuture<WriteResult> future = docRef.set(firestoreMessage);
        future.get();

        return new Message(
            docRef.getId(),
            message.username(),
            firestoreMessage.getTimestamp().toDate().getTime(),
            message.text()
        );
    }

    public List<Message> getMessages(String fromId)
        throws ExecutionException, InterruptedException {
        CollectionReference messagesCollection = firestore.collection(
            COLLECTION_NAME
        );

        Query query;
        if (fromId != null) {
            DocumentReference docRef = messagesCollection.document(fromId);
            DocumentSnapshot snapshot = docRef.get().get();

            if (snapshot.contains("timestamp")) {
                query = messagesCollection
                    .orderBy("timestamp")
                    .startAfter(snapshot)
                    .limitToLast(20);
            } else {
                logger.warning(
                    "DocumentSnapshot sans timestamp pour l'ID: " + fromId
                );
                query = messagesCollection.orderBy("timestamp").limitToLast(20);
            }
        } else {
            query = messagesCollection.orderBy("timestamp").limitToLast(20);
        }

        ApiFuture<QuerySnapshot> querySnapshotFuture = query.get();
        List<FirestoreMessage> firestoreMessages = querySnapshotFuture
            .get()
            .toObjects(FirestoreMessage.class);
        return firestoreMessages
            .stream()
            .map(fm ->
                new Message(
                    null,
                    fm.getUsername(),
                    fm.getTimestamp().toDate().getTime(),
                    fm.getText()
                )
            )
            .toList();
    }
}
