package com.inf5190.chat.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

import com.inf5190.chat.auth.model.LoginRequest;
import com.inf5190.chat.auth.model.LoginResponse;
import com.inf5190.chat.auth.repository.FirestoreUserAccount;
import com.inf5190.chat.auth.repository.UserAccountRepository;
import com.inf5190.chat.auth.session.SessionData;
import com.inf5190.chat.auth.session.SessionManager;
import java.util.concurrent.ExecutionException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

public class TestAuthController {

    private final String username = "username";
    private final String password = "pwd";
    private final String hashedPassword = "hash";
    private final FirestoreUserAccount userAccount = new FirestoreUserAccount(
        this.username,
        this.hashedPassword
    );

    private final LoginRequest loginRequest = new LoginRequest(
        this.username,
        this.password
    );

    @Mock
    private SessionManager mockSessionManager;

    @Mock
    private UserAccountRepository mockAccountRepository;

    @Mock
    private PasswordEncoder mockPasswordEncoder;

    private AuthController authController;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        this.authController = new AuthController(
            mockSessionManager,
            mockAccountRepository,
            mockPasswordEncoder
        );
    }

    @Test
    public void LoginNewUserAccount()
        throws InterruptedException, ExecutionException {
        final SessionData expectedSessionData = new SessionData(this.username);
        final String expectedUsername = this.username;

        // Simulate that the user account does not exist initially
        when(this.mockAccountRepository.getUserAccount(loginRequest.username()))
            .thenReturn(null) // First call returns null
            .thenReturn(userAccount); // Second call returns the new user account

        // Simulate encoding the password
        when(
            this.mockPasswordEncoder.encode(loginRequest.password())
        ).thenReturn(this.hashedPassword);

        // Simulate password matching
        when(
            this.mockPasswordEncoder.matches(
                    loginRequest.password(),
                    this.hashedPassword
                )
        ).thenReturn(true);

        // Simulate session creation
        when(
            this.mockSessionManager.addSession(expectedSessionData)
        ).thenReturn(expectedUsername);

        // Perform the login operation
        ResponseEntity<LoginResponse> response =
            this.authController.login(loginRequest);

        // Assertions
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().username()).isEqualTo(expectedUsername);

        // Verify interactions
        verify(this.mockAccountRepository, times(2)).getUserAccount(
            this.username
        );
        verify(this.mockAccountRepository, times(1)).createUserAccount(
            new FirestoreUserAccount(this.username, this.hashedPassword)
        );
        verify(this.mockPasswordEncoder, times(1)).encode(this.password);
        verify(this.mockPasswordEncoder, times(1)).matches(
            this.password,
            this.hashedPassword
        );
        verify(this.mockSessionManager, times(1)).addSession(
            expectedSessionData
        );
    }

    @Test
    public void loginExistingUserAccountWithCorrectPassword()
        throws InterruptedException, ExecutionException {
        final SessionData expectedSessionData = new SessionData(this.username);
        final String expectedUsername = this.username;

        when(
            this.mockAccountRepository.getUserAccount(loginRequest.username())
        ).thenReturn(userAccount);
        when(
            this.mockPasswordEncoder.matches(
                    loginRequest.password(),
                    this.hashedPassword
                )
        ).thenReturn(true);
        when(
            this.mockSessionManager.addSession(expectedSessionData)
        ).thenReturn(expectedUsername);

        ResponseEntity<LoginResponse> response =
            this.authController.login(loginRequest);
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().username()).isEqualTo(expectedUsername);

        verify(this.mockAccountRepository, times(1)).getUserAccount(
            this.username
        );
        verify(this.mockPasswordEncoder, times(1)).matches(
            this.password,
            this.hashedPassword
        );
        verify(this.mockSessionManager, times(1)).addSession(
            expectedSessionData
        );
    }

    @Test
    public void loginExistingUserAccountWithIncorrectPassword()
        throws InterruptedException, ExecutionException {
        when(
            this.mockAccountRepository.getUserAccount(loginRequest.username())
        ).thenReturn(userAccount);
        when(
            this.mockPasswordEncoder.matches(
                    loginRequest.password(),
                    this.hashedPassword
                )
        ).thenReturn(false);

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> {
                this.authController.login(loginRequest);
            }
        );

        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        verify(this.mockAccountRepository, times(1)).getUserAccount(
            this.username
        );
        verify(this.mockPasswordEncoder, times(1)).matches(
            this.password,
            this.hashedPassword
        );
        verify(this.mockSessionManager, times(0)).addSession(any());
    }

    @Test
    public void LoginUserAccountRepositoryThrowsException()
        throws InterruptedException, ExecutionException {
        when(
            this.mockAccountRepository.getUserAccount(loginRequest.username())
        ).thenThrow(
            new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Firestore exception")
        );

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
            () -> {
                this.authController.login(loginRequest);
            }
        );

        assertThat(exception.getMessage()).contains("Firestore exception");

        verify(this.mockAccountRepository, times(1)).getUserAccount(
            this.username
        );
        verifyNoInteractions(this.mockPasswordEncoder);
        verifyNoInteractions(this.mockSessionManager);
    }
}
