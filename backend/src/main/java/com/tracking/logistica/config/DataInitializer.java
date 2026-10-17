package com.tracking.logistica.config;

import com.tracking.logistica.entity.Role;
import com.tracking.logistica.entity.User;
import com.tracking.logistica.entity.LogisticCenter;
import com.tracking.logistica.repository.UserRepository;
import com.tracking.logistica.repository.LogisticCenterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final LogisticCenterRepository logisticCenterRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (logisticCenterRepository.count() == 0) {
            logisticCenterRepository.saveAll(java.util.List.of(
                    LogisticCenter.builder().name("Centro de origen").city("Bogotá").address("Sede de origen").active(true).build(),
                    LogisticCenter.builder().name("Centro central").city("Bogotá").address("Sede central").active(true).build(),
                    LogisticCenter.builder().name("Centro regional").city("Medellín").address("Sede regional").active(true).build()));
        }
        if (!userRepository.existsByEmail("admin@tracking.com")) {
            User admin = User.builder()
                    .email("admin@tracking.com")
                    .fullName("Administrador del Sistema")
                    .identification("ADMIN001")
                    .password(passwordEncoder.encode("admin1234"))
                    .address("Sede principal")
                    .cityCountry("Medellín, Colombia")
                    .role(Role.ADMINISTRADOR)
                    .build();

            userRepository.save(admin);
            System.out.println(">>> Usuario administrador creado exitosamente");
        }
    }
}