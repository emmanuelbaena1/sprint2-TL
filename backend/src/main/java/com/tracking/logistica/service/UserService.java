package com.tracking.logistica.service;

import com.tracking.logistica.dto.AuthResponse;
import com.tracking.logistica.dto.LoginRequest;
import com.tracking.logistica.dto.RegisterRequest;
import com.tracking.logistica.dto.UserResponse;
import com.tracking.logistica.entity.Role;
import com.tracking.logistica.entity.User;
import com.tracking.logistica.exception.ResourceAlreadyExistsException;
import com.tracking.logistica.exception.ResourceNotFoundException;
import com.tracking.logistica.repository.UserRepository;
import com.tracking.logistica.repository.ShipmentRepository;
import com.tracking.logistica.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.authentication.BadCredentialsException;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final ShipmentRepository shipmentRepository;

    public UserResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase(Locale.ROOT))) {
            throw new ResourceAlreadyExistsException(
                "Ya existe una cuenta con el correo: " + request.getEmail());
        }

        if (userRepository.existsByIdentification(request.getIdentification().trim())) {
            throw new ResourceAlreadyExistsException(
                "Ya existe una cuenta con la identificación: " + request.getIdentification());
        }

        User user = User.builder()
                .email(request.getEmail().trim().toLowerCase(Locale.ROOT))
                .fullName(request.getFullName().trim())
                .identification(request.getIdentification().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .address(request.getAddress().trim())
                .cityCountry(request.getCityCountry().trim())
                .build();

        User savedUser = userRepository.save(user);

        return mapToResponse(savedUser);
    }

    @Transactional(noRollbackFor = BadCredentialsException.class)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailForUpdate(request.getEmail().trim()).orElse(null);
        if (user == null) throw new BadCredentialsException("Credenciales no válidas");
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        if (user.isAccountLocked()) throw new BadCredentialsException("Tu cuenta está bloqueada. Solicita al administrador que la desbloquee.");
        if (user.getPenaltyUntil() != null && now.isBefore(user.getPenaltyUntil())) {
            long seconds = java.time.Duration.between(now, user.getPenaltyUntil()).toSeconds() + 1;
            throw new BadCredentialsException("Por seguridad, espera " + seconds + " segundos antes de volver a intentarlo.");
        }
        if (user.getPenaltyUntil() != null) {
            user.setPenaltyUntil(null);
            user.setFailedLoginCount(0);
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            int count = user.getFailedLoginCount() + 1;
            user.setFailedLoginCount(count);
            if (user.getPenaltyLevel() == 0 && count >= 5) {
                user.setPenaltyUntil(now.plusMinutes(1)); user.setPenaltyLevel(1); user.setFailedLoginCount(0);
                userRepository.save(user);
                throw new BadCredentialsException("Se alcanzó el límite de intentos. Espera 1 minuto antes de volver a intentarlo.");
            } else if (user.getPenaltyLevel() == 1 && count >= 2) {
                user.setPenaltyUntil(now.plusMinutes(2)); user.setPenaltyLevel(2); user.setFailedLoginCount(0);
                userRepository.save(user);
                throw new BadCredentialsException("Se alcanzó el siguiente límite de intentos. Espera 2 minutos antes de volver a intentarlo.");
            } else if (user.getPenaltyLevel() >= 2 && count >= 2) {
                user.setAccountLocked(true); user.setPenaltyUntil(null); user.setFailedLoginCount(0);
                userRepository.save(user);
                throw new BadCredentialsException("Tu cuenta quedó bloqueada por varios intentos fallidos. Solicita al administrador que la desbloquee.");
            }
            userRepository.save(user);
            int remaining = (user.getPenaltyLevel() == 0 ? 5 : 2) - count;
            throw new BadCredentialsException("Correo o contraseña incorrectos. Te quedan " + remaining + (remaining == 1 ? " intento antes de una pausa de seguridad." : " intentos antes de una pausa de seguridad."));
        }
        user.setFailedLoginCount(0);
        user.setPenaltyLevel(0);
        user.setPenaltyUntil(null);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el perfil de usuario."));
        return mapToResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(String email, com.tracking.logistica.dto.ProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email.trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el perfil de usuario."));
        user.setAddress(request.getAddress().trim());
        user.setCityCountry(request.getCityCountry().trim());
        return mapToResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findUsersWithShipments() {
        return shipmentRepository.findAll().stream()
                .map(shipment -> shipment.getRecipientIdentification())
                .distinct()
                .map(userRepository::findByIdentification)
                .flatMap(java.util.Optional::stream)
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public UserResponse updateRole(Long userId, String newRole, String adminEmail) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "No se encontró usuario con ID: " + userId));

        Role role;
        try {
            role = Role.valueOf(newRole.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Rol no válido: " + newRole);
        }

        if (role == Role.ADMINISTRADOR || user.getRole() == Role.ADMINISTRADOR) {
            throw new IllegalArgumentException(
                "No se puede asignar ni modificar el rol Administrador mediante este mecanismo");
        }

        if (role == user.getRole()) return mapToResponse(user);

        user.setRole(role);
        User updatedUser = userRepository.save(user);

        // Stateless JWTs issued before the change still carry the old role. Remove
        // them from current use by making authenticated requests resolve today's role.

        return mapToResponse(updatedUser);
    }

    @Transactional
    public UserResponse unlockAccount(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        user.setAccountLocked(false); user.setPenaltyLevel(0); user.setFailedLoginCount(0); user.setPenaltyUntil(null);
        return mapToResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findLockedUsers() { return userRepository.findAll().stream().filter(User::isAccountLocked).map(this::mapToResponse).toList(); }

    @Transactional(readOnly = true)
    public List<com.tracking.logistica.dto.AccountSecurityResponse> findAccountsUnderSecurityPenalty() {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        return userRepository.findAll().stream()
                .filter(user -> user.isAccountLocked() || (user.getPenaltyUntil() != null && user.getPenaltyUntil().isAfter(now)))
                .map(user -> com.tracking.logistica.dto.AccountSecurityResponse.builder()
                        .id(user.getId()).email(user.getEmail()).fullName(user.getFullName())
                        .accountLocked(user.isAccountLocked()).penaltyUntil(user.getPenaltyUntil()).build())
                .toList();
    }
    public long shipmentCount() { return shipmentRepository.count(); }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .identification(user.getIdentification())
                .address(user.getAddress())
                .cityCountry(user.getCityCountry())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}

