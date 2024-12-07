package com.inf5190.chat.messages.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.google.cloud.storage.Bucket;
import com.google.cloud.storage.Storage;
import com.google.firebase.cloud.StorageClient;
import com.inf5190.chat.messages.model.Message;
import com.inf5190.chat.messages.model.NewMessageRequest;
import io.jsonwebtoken.io.Decoders;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.logging.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

@Repository
public class MessageRepository {

    private static final String COLLECTION_NAME = "messages";


    @Autowired
    @Qualifier("storageBucketName")
    private String storageBucketName;


    private static final Logger logger = Logger.getLogger(
        MessageRepository.class.getName()
    );

    private final Firestore firestore;
    private final StorageClient storageClient;

    @Autowired
    public MessageRepository(Firestore firestore, StorageClient storageClient) {
        this.firestore = firestore;
        this.storageClient = storageClient;
    }

    public Message createMessage(NewMessageRequest message)
        throws ExecutionException, InterruptedException {
        CollectionReference messagesCollection = firestore.collection(
            COLLECTION_NAME
        );

        DocumentReference docRef = messagesCollection.document();
        String imageUrl = null;

        if (message.imageData() != null) {
            Bucket bucket = storageClient.bucket(storageBucketName);
            String path = String.format(
                "images/%s.%s",
                docRef.getId(),
                message.imageData().type()
            );
            bucket.create(
                path,
                Decoders.BASE64.decode(message.imageData().data()),
                Bucket.BlobTargetOption.predefinedAcl(
                    Storage.PredefinedAcl.PUBLIC_READ
                )
            );
            imageUrl = String.format(
                "https://storage.googleapis.com/%s/%s",
                storageBucketName,
                path
            );
        }

        FirestoreMessage firestoreMessage = new FirestoreMessage(
            docRef.getId(),
            message.username(),
            Timestamp.now(),
            message.text(),
            imageUrl
        );

        ApiFuture<WriteResult> future = docRef.set(firestoreMessage);
        future.get();

        return new Message(
            docRef.getId(),
            message.text(),
            message.username(),
            firestoreMessage.getTimestamp().toDate().getTime(),
            imageUrl
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

            if (snapshot.exists() && snapshot.contains("timestamp")) {
                query = messagesCollection
                    .orderBy("timestamp")
                    .startAfter(snapshot)
                    .limitToLast(20);
            } else {
                logger.warning(
                    "DocumentSnapshot introuvable ou sans timestamp pour l'ID: " +
                    fromId
                );
                throw new IllegalArgumentException("Message not found");
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
                    fm.getId(),
                    fm.getText(),
                    fm.getUsername(),
                    fm.getTimestamp().toDate().getTime(),
                    fm.getImageUrl()
                )
            )
            .toList();
    }
}
