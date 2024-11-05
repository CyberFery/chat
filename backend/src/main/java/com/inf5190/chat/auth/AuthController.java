package com.inf5190.chat.auth;

import com.inf5190.chat.auth.repository.FirestoreUserAccount;
import com.inf5190.chat.auth.repository.UserAccountRepository;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import com.inf5190.chat.auth.model.LoginRequest;
import com.inf5190.chat.auth.model.LoginResponse;
import com.inf5190.chat.auth.session.SessionManager;
import jakarta.servlet.http.Cookie;
import com.inf5190.chat.auth.session.SessionData;

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

    public AuthController(SessionManager sessionManager, UserAccountRepository userAccountRepository) {
        this.sessionManager = sessionManager;
        this.userAccountRepository = userAccountRepository;
    }

    @PostMapping(AUTH_LOGIN_PATH)
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        FirestoreUserAccount userAccount = getUserAccountIfExists(loginRequest.username());

        if(userAccount == null) {
            // Ceci est temporel. Les exceptions seront gérées plus tard lors du TP 4.
            if(
                !createUserAccount(loginRequest.username(), loginRequest.password())
            ) {
                return ResponseEntity.badRequest().body(
                        new LoginResponse("Could not create user account.")
                );
            }


            userAccount = getUserAccountIfExists(loginRequest.username());
        }

        if(userAccount.getUsername().equals(loginRequest.username()) &&
                userAccount.getEncodedPassword().equals(loginRequest.password())) {
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
            return ResponseEntity.badRequest().body(
                    new LoginResponse("Invalid username or password")
            );
        }
    }

    @PostMapping(AUTH_LOGOUT_PATH)
    public ResponseEntity<Void> logout(@CookieValue(SESSION_ID_COOKIE_NAME) Cookie sessionCookie) {
        sessionManager.removeSession(sessionCookie.getValue());

        ResponseCookie cookie = ResponseCookie.from(SESSION_ID_COOKIE_NAME, "")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header("Set-Cookie", cookie.toString())
                .build();
    }

    /**
     * Retourne un compte utilisateur s'il existe. Les exceptions seront gérées plus tard lors du TP 4.
     * @param username nom d'utilisateur à chercher.
     * @return le compte utilisateur s'il existe, null sinon.
     */
    private FirestoreUserAccount getUserAccountIfExists(String username) {
        try {
            return userAccountRepository.getUserAccount(username);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Crée un compte utilisateur. Les exceptions seront gérées plus tard lors du TP 4.
     * @param username nom d'utilisateur à créer.
     * @param password mot de passe à sauvegarder.
     * @return true si le compte a été créé, false sinon.
     */
    private boolean createUserAccount(String username, String password) {
        try {
            userAccountRepository.createUserAccount(
                    new FirestoreUserAccount(
                            username,
                            password
                    )
            );

            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
