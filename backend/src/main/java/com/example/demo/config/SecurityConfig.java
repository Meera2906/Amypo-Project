package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import java.util.Arrays;
import java.util.Collections;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(request -> {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(Collections.singletonList("http://localhost:3000"));
                config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
                config.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
                config.setAllowCredentials(true);
                return config;
            }))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/users/*/status").hasAnyRole("ACADEMIC_ADMIN", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/subjects/**").hasAnyRole("ACADEMIC_ADMIN", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/subjects/**").hasAnyRole("ACADEMIC_ADMIN", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/subjects/**").hasAnyRole("ACADEMIC_ADMIN", "ADMIN")
                .requestMatchers("/api/enrollments/**").hasRole("LEARNER")
                .requestMatchers(HttpMethod.POST, "/api/feedback").hasRole("LEARNER")
                .requestMatchers(HttpMethod.GET, "/api/feedback").hasAnyRole("ACADEMIC_ADMIN", "ADMIN", "SUPPORT_AGENT", "SUPPORT")
                .requestMatchers("/api/analytics/stats").hasAnyRole("ACADEMIC_ADMIN", "ADMIN")
                .requestMatchers("/api/analytics/mentor/**").hasRole("MENTOR")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
