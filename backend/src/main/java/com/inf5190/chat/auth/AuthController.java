package com.inf5190.chat.auth;

import com.inf5190.chat.auth.repository.FirestoreUserAccount;
import com.inf5190.chat.auth.repository.UserAccountRepository;
import com.inf5190.chat.websocket.WebSocketManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import com.inf5190.chat.auth.model.LoginRequest;
import com.inf5190.chat.auth.model.LoginResponse;
import com.inf5190.chat.auth.session.SessionManager;
import jakarta.servlet.http.Cookie;
import com.inf5190.chat.auth.session.SessionData;
import org.springframework.web.server.ResponseStatusException;

import java.util.concurrent.ExecutionException;

/**
 * Contrôleur qui gère l'API de login et logout.
 */
@RestController()
public class AuthController {
    public static final String AUTH_LOGIN_PATH = "/auth/login";
    public static final String AUTH_LOGOUT_PATH = "/auth/logout";
    public static final String SESSION_ID_COOKIE_NAME = "sid";

    private final SessionManager sessionManager;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    private final Logger LOGGER = LoggerFactory.getLogger(AuthController.class);

    public AuthController(SessionManager sessionManager, UserAccountRepository userAccountRepository, PasswordEncoder passwordEncoder) {
        this.sessionManager = sessionManager;
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping(AUTH_LOGIN_PATH)
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest)
        throws ResponseStatusException {

        try {
            FirestoreUserAccount userAccount = userAccountRepository.getUserAccount(loginRequest.username());

            if(userAccount == null) {
                userAccountRepository.createUserAccount(
                        new FirestoreUserAccount(
                                loginRequest.username(),
                                passwordEncoder.encode(loginRequest.password())
                        )
                );
                userAccount = userAccountRepository.getUserAccount(loginRequest.username());
            }

            if(userAccount.getUsername().equals(loginRequest.username()) &&
                    passwordEncoder.matches(loginRequest.password(), userAccount.getEncodedPassword())
            ) {
                SessionData sessionData = new SessionData(loginRequest.username());

                String sessionId = sessionManager.addSession(sessionData);
                ResponseCookie cookie = ResponseCookie.from(SESSION_ID_COOKIE_NAME, sessionId)
                        .secure(true)
                        .httpOnly(true)
                        .path("/")
                        .maxAge(60 * 60 * 24)
                        .build();

                return ResponseEntity.ok()
                        .header("Set-Cookie", cookie.toString())
                        .body(new LoginResponse(sessionData.username()));
            } else {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN);
            }

        } catch (ResponseStatusException e) {
            throw e;
        } catch(InterruptedException | ExecutionException e) {
            LOGGER.warn("Erreur dans Firestore.", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Firestore exception");
        } catch (Exception e) {
            LOGGER.warn("Erreur inattendue.", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unexpected error on login.");
        }
    }

    @PostMapping(AUTH_LOGOUT_PATH)
    public ResponseEntity<Void> logout(@CookieValue(SESSION_ID_COOKIE_NAME) Cookie sessionCookie) {
        ResponseCookie cookie = ResponseCookie.from(SESSION_ID_COOKIE_NAME, "")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header("Set-Cookie", cookie.toString())
                .build();
    }

}
