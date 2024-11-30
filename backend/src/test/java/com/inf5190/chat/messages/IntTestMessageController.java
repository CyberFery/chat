package com.inf5190.chat.messages;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.WriteResult;
import com.inf5190.chat.auth.model.LoginRequest;
import com.inf5190.chat.auth.model.LoginResponse;
import com.inf5190.chat.messages.model.Message;
import com.inf5190.chat.messages.model.NewMessageRequest;
import com.inf5190.chat.messages.repository.FirestoreMessage;
import java.net.HttpCookie;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.client.TestRestTemplate.HttpClientOption;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.PropertySource;
import org.springframework.http.*;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@PropertySource("classpath:firebase.properties")
public class IntTestMessageController {

    private final FirestoreMessage message1 = new FirestoreMessage(
        "1",
        "u1",
        Timestamp.now(),
        "t1",
        null
    );
    private final FirestoreMessage message2 = new FirestoreMessage(
        "2",
        "u2",
        Timestamp.now(),
        "t2",
        null
    );

    @Value("${firebase.project.id}")
    private String firebaseProjectId;

    @Value("${firebase.emulator.port}")
    private String emulatorPort;

    @LocalServerPort
    private int port;

    private TestRestTemplate restTemplate;

    @Autowired
    private Firestore firestore;

    private String messagesEndpointUrl;
    private String loginEndpointUrl;

    @BeforeAll
    public static void checkRunAgainstEmulator() {
        checkEmulators();
    }

    @BeforeEach
    public void setup() throws InterruptedException, ExecutionException {
        this.restTemplate = new TestRestTemplate(
            HttpClientOption.ENABLE_COOKIES
        );
        this.messagesEndpointUrl = "http://localhost:" + port + "/messages";
        this.loginEndpointUrl = "http://localhost:" + port + "/auth/login";

        this.firestore.collection("messages")
            .document("1")
            .create(this.message1)
            .get();
        this.firestore.collection("messages")
            .document("2")
            .create(this.message2)
            .get();
    }

    @AfterEach
    public void tearDown() {
        this.restTemplate.delete(
                "http://localhost:" +
                this.emulatorPort +
                "/emulator/v1/projects/" +
                this.firebaseProjectId +
                "/databases/(default)/documents"
            );
    }

    @Test
    public void getMessagesNotLoggedIn() {
        ResponseEntity<String> response =
            this.restTemplate.getForEntity(
                    this.messagesEndpointUrl,
                    String.class
                );

        assertThat(response.getStatusCodeValue()).isEqualTo(403);
    }

    @Test
    public void postMessageNotLoggedIn() {
        NewMessageRequest newMessage = new NewMessageRequest(
            "username",
            "Hello world",
            null
        );
        ResponseEntity<String> response =
            this.restTemplate.postForEntity(
                    this.messagesEndpointUrl,
                    newMessage,
                    String.class
                );

        assertThat(response.getStatusCodeValue()).isEqualTo(403);
    }

    @Test
    public void getMessagesWithoutFromId() {
        final String sessionCookie = this.login();

        final HttpHeaders headers =
            this.createHeadersWithSessionCookie(sessionCookie);
        final HttpEntity<Object> entity = new HttpEntity<>(headers);
        final ResponseEntity<Message[]> response =
            this.restTemplate.exchange(
                    this.messagesEndpointUrl,
                    HttpMethod.GET,
                    entity,
                    Message[].class
                );

        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody())
            .hasSize(2)
            .extracting("id", "username", "text")
            .containsExactlyInAnyOrder(
                tuple("1", "u1", "t1"),
                tuple("2", "u2", "t2")
            );
    }

    @Test
    public void getMessagesWithFromId()
        throws InterruptedException, ExecutionException {
        FirestoreMessage message3 = new FirestoreMessage(
            "3",
            "u3",
            Timestamp.now(),
            "t3",
            null
        );
        this.firestore.collection("messages")
            .document("3")
            .create(message3)
            .get();

        final String sessionCookie = this.login();

        final HttpHeaders headers =
            this.createHeadersWithSessionCookie(sessionCookie);
        final HttpEntity<Object> entity = new HttpEntity<>(headers);
        final String urlWithFromId = this.messagesEndpointUrl + "?fromId=1";
        final ResponseEntity<Message[]> response =
            this.restTemplate.exchange(
                    urlWithFromId,
                    HttpMethod.GET,
                    entity,
                    Message[].class
                );

        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody())
            .hasSize(2)
            .extracting("id", "username", "text")
            .containsExactlyInAnyOrder(
                tuple("2", "u2", "t2"),
                tuple("3", "u3", "t3")
            );
    }

    @Test
    public void getMessagesMoreThanTwenty()
        throws InterruptedException, ExecutionException {
        for (int i = 3; i <= 27; i++) {
            FirestoreMessage message = new FirestoreMessage(
                String.valueOf(i),
                "user" + i,
                Timestamp.now(),
                "text" + i,
                null
            );
            this.firestore.collection("messages")
                .document(String.valueOf(i))
                .create(message)
                .get();
        }

        final String sessionCookie = this.login();

        final HttpHeaders headers =
            this.createHeadersWithSessionCookie(sessionCookie);
        final HttpEntity<Object> entity = new HttpEntity<>(headers);
        final ResponseEntity<Message[]> response =
            this.restTemplate.exchange(
                    this.messagesEndpointUrl,
                    HttpMethod.GET,
                    entity,
                    Message[].class
                );

        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody())
            .hasSize(20)
            .extracting("id")
            .doesNotContain("1", "2") 
            .contains("8", "9", "10", "27"); 
    }

    @Test
    public void getMessagesWithInvalidFromId()
        throws InterruptedException, ExecutionException {
        final String sessionCookie = this.login();

        final HttpHeaders headers =
            this.createHeadersWithSessionCookie(sessionCookie);
        final HttpEntity<Object> entity = new HttpEntity<>(headers);
        final String invalidFromId = "invalid-id";
        final String urlWithInvalidFromId =
            this.messagesEndpointUrl + "?fromId=" + invalidFromId;
        final ResponseEntity<String> response =
            this.restTemplate.exchange(
                    urlWithInvalidFromId,
                    HttpMethod.GET,
                    entity,
                    String.class
                );

        assertThat(response.getStatusCodeValue()).isEqualTo(404);
    }



    /**
     * Logs in and returns the session cookie.
     *
     * @return the session cookie.
     */
    private String login() {
        ResponseEntity<LoginResponse> response =
            this.restTemplate.postForEntity(
                    this.loginEndpointUrl,
                    new LoginRequest("username", "password"),
                    LoginResponse.class
                );

        String setCookieHeader = response
            .getHeaders()
            .getFirst(HttpHeaders.SET_COOKIE);
        HttpCookie sessionCookie = HttpCookie.parse(setCookieHeader).get(0);
        return sessionCookie.getName() + "=" + sessionCookie.getValue();
    }

    private HttpEntity<NewMessageRequest> createRequestEntityWithSessionCookie(
        NewMessageRequest messageRequest,
        String cookieValue
    ) {
        HttpHeaders headers = this.createHeadersWithSessionCookie(cookieValue);
        return new HttpEntity<>(messageRequest, headers);
    }

    private HttpHeaders createHeadersWithSessionCookie(String cookieValue) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.COOKIE, cookieValue);
        return headers;
    }

    private static void checkEmulators() {
        final String firebaseEmulator = System.getenv()
            .get("FIRESTORE_EMULATOR_HOST");
        if (firebaseEmulator == null || firebaseEmulator.length() == 0) {
            System.err.println(
                "**********************************************************************************************************"
            );
            System.err.println(
                "******** You need to set FIRESTORE_EMULATOR_HOST=localhost:8181 in your system properties. ********"
            );
            System.err.println(
                "**********************************************************************************************************"
            );
        }
        assertThat(firebaseEmulator)
            .as(
                "You need to set FIRESTORE_EMULATOR_HOST=localhost:8181 in your system properties."
            )
            .isNotEmpty();
    }
}
