package com.inf5190.chat.auth.repository;

import com.google.cloud.firestore.Firestore;
import java.util.concurrent.ExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class UserAccountRepository {

    private static final String COLLECTION_NAME = "userAccounts";
    private final Firestore firestore;

    @Autowired
    public UserAccountRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    public FirestoreUserAccount getUserAccount(String username)
        throws InterruptedException, ExecutionException {
        return firestore
            .collection(COLLECTION_NAME)
            .document(username)
            .get()
            .get()
            .toObject(FirestoreUserAccount.class);
    }

    public void createUserAccount(FirestoreUserAccount userAccount)
        throws InterruptedException, ExecutionException {
        firestore
            .collection(COLLECTION_NAME)
            .document(userAccount.getUsername())
            .set(userAccount)
            .get();
    }
}
