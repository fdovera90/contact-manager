<?php

namespace App\Controller;

use App\Entity\Contact;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use DateTimeImmutable;

class ContactController extends AbstractController
{
    #[Route('/api/contacts', name: 'read', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $contacts = $em->getRepository(Contact::class)->findBy(['active' => true]);

        $data = array_map([$this, 'serializeContact'], $contacts);

        return $this->json($data);
    }

    #[Route('/api/contacts', name: 'create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, ValidatorInterface $validator): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Validar que los datos mínimos existan
        if (!isset($data['name'], $data['email'])) {
            return $this->json(
                ['error' => 'Name and email are required'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // Verificar si ya existe un contacto con este email
        $existing = $em->getRepository(Contact::class)->findOneBy(['email' => $data['email']]);
        if ($existing) {
            return $this->json(
                ['error' => 'A contact with this email already exists'],
                Response::HTTP_CONFLICT // 409 Conflict
            );
        }

        $contact = new Contact();
        $contact->setName($data['name']);
        $contact->setLastname($data['lastname'] ?? null);
        $contact->setEmail($data['email']);
        $contact->setPhone($data['phone'] ?? null);

        $errors = $validator->validate($contact);
        if (count($errors) > 0) {
            $messages = [];
            foreach ($errors as $error) {
                $messages[] = $error->getMessage();
            }
            return $this->json(['errors' => $messages], Response::HTTP_BAD_REQUEST);
        }

        $em->persist($contact);
        $em->flush();

        return $this->json(
            [
                'message' => 'Contact created successfully',
                'contact' => $this->serializeContact($contact)
            ],
            Response::HTTP_CREATED
        );
    }

    #[Route('/api/contacts/{id}', name: 'update', methods: ['PUT'])]
    public function update(int $id, Request $request, EntityManagerInterface $em, ValidatorInterface $validator): JsonResponse
    {
        $contact = $em->getRepository(Contact::class)->find($id);

        if (!$contact) {
            return $this->json(
                ['error' => 'Contact not found'],
                Response::HTTP_NOT_FOUND
            );
        }

        if (!$contact->isActive()) {
            return $this->json([
                'error' => 'This contact has been deleted and cannot be updated.'
            ], JsonResponse::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        // Validar y actualizar solo los campos enviados
        if (isset($data['name'])) {
            $contact->setName($data['name']);
        }

        if (isset($data['lastname'])) {
            $contact->setLastname($data['lastname']);
        }

        if (isset($data['email'])) {
            $existing = $em->getRepository(Contact::class)->findOneBy(['email' => $data['email']]);
            if ($existing && $existing->getId() !== $contact->getId()) {
                return $this->json(
                    ['error' => 'A contact with this email already exists'],
                    Response::HTTP_CONFLICT
                );
            }
            $contact->setEmail($data['email']);
        }

        if (isset($data['phone'])) {
            $contact->setPhone($data['phone']);
        }

        $errors = $validator->validate($contact);
        if (count($errors) > 0) {
            $messages = [];
            foreach ($errors as $error) {
                $messages[] = $error->getMessage();
            }
            return $this->json(['errors' => $messages], Response::HTTP_BAD_REQUEST);
        }

        $contact->setUpdatedAt(new DateTimeImmutable());
        $em->flush();

        return $this->json([
            'message' => 'Contact updated successfully',
            'contact' => $this->serializeContact($contact)
        ]);
    }

    #[Route('/api/contacts/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(int $id, EntityManagerInterface $em): JsonResponse
    {
        $contact = $em->getRepository(Contact::class)->find($id);

        if (!$contact) {
            return $this->json(['error' => 'Contact not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        if (!$contact->isActive()) {
            return $this->json([
                'error' => 'This contact has already been deleted.'
            ], JsonResponse::HTTP_FORBIDDEN);
        }

        // Eliminación lógica
        $contact->setActive(false);
        $contact->setUpdatedAt(new \DateTimeImmutable());

        $em->flush();

        return $this->json([
            'message' => 'Contact deleted successfully',
            'contact' => $this->serializeContact($contact)
        ]);
    }

    private function serializeContact(Contact $contact): array
    {
        return [
            'id' => $contact->getId(),
            'name' => $contact->getName(),
            'lastname' => $contact->getLastname(),
            'email' => $contact->getEmail(),
            'phone' => $contact->getPhone(),
            'active' => $contact->isActive(),
            'createdAt' => $contact->getCreatedAt()?->format('Y-m-d H:i:s'),
            'updatedAt' => $contact->getUpdatedAt()?->format('Y-m-d H:i:s'),
        ];
    }
}
