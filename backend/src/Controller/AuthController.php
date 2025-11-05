<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AuthController extends AbstractController
{
    #[Route('/api/login', name: 'login', methods: ['POST'])]
    public function login(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['username']) || !isset($data['password'])) {
            return $this->json([
                'success' => false,
                'message' => 'Usuario y contraseña son requeridos'
            ], Response::HTTP_BAD_REQUEST);
        }

        $username = isset($data['username']) ? trim($data['username']) : null;
        $password = isset($data['password']) ? trim($data['password']) : null;

        if (!$username || !$password) {
            return $this->json([
                'success' => false,
                'message' => 'Usuario y contraseña son requeridos',
                'debug' => [
                    'received_username' => $username !== null,
                    'received_password' => $password !== null,
                    'username_length' => $username ? strlen($username) : 0,
                    'password_length' => $password ? strlen($password) : 0,
                    'raw_data' => $data
                ]
            ], Response::HTTP_BAD_REQUEST);
        }

        $user = $em->getRepository(User::class)->findOneBy(['username' => $username]);
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Credenciales inválidas',
                'debug' => 'Usuario no encontrado'
            ], Response::HTTP_UNAUTHORIZED);
        }

        $isValid = $passwordHasher->isPasswordValid($user, $password);        
        if (!$isValid) {
            // Generar un nuevo hash con la misma contraseña para comparar
            $newHash = $passwordHasher->hashPassword($user, $password);
            $storedHash = $user->getPassword();
            
            // Verificar con diferentes variaciones de la contraseña
            $passwordVariations = [
                'original' => $password,
                'trimmed' => trim($password),
                'no_whitespace' => preg_replace('/\s+/', '', $password),
            ];
            
            $variationsResults = [];
            foreach ($passwordVariations as $key => $variation) {
                $variationsResults[$key] = $passwordHasher->isPasswordValid($user, $variation);
            }
            
            return $this->json([
                'success' => false,
                'message' => 'Credenciales inválidas',
                'debug' => [
                    'password_validation_failed' => true,
                    'password_length' => strlen($password),
                    'password_bytes' => bin2hex($password),
                    'stored_hash_prefix' => substr($storedHash, 0, 30),
                    'new_hash_prefix' => substr($newHash, 0, 30),
                    'hashes_match' => $storedHash === $newHash,
                    'variations_results' => $variationsResults,
                    'username_received' => $username
                ]
            ], Response::HTTP_UNAUTHORIZED);
        }

        $token = base64_encode($username . ':' . time());
        return $this->json([
            'success' => true,
            'message' => 'Login exitoso',
            'token' => $token,
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'roles' => $user->getRoles()
            ]
        ], Response::HTTP_OK);
    }

    #[Route('/api/logout', name: 'logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        return $this->json([
            'success' => true,
            'message' => 'Logout exitoso'
        ], Response::HTTP_OK);
    }
}

