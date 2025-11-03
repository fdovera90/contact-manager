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
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Exception\ExtraAttributesException;
use \DateTimeImmutable;

class ContactController extends AbstractController
{
    #[Route('/api/contacts', name: 'read', methods: ['GET'])]
    public function list(EntityManagerInterface $em, SerializerInterface $serializer): JsonResponse
    {
        $contacts = $em->getRepository(Contact::class)->findBy(['active' => true]);

        $data = $serializer->serialize($contacts, 'json', [AbstractNormalizer::GROUPS => 'contact:read']);

        return new JsonResponse($data, JsonResponse::HTTP_OK, [], true);
    }

    #[Route('/api/contacts', name: 'create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, ValidatorInterface $validator, SerializerInterface $serializer): JsonResponse
    {
        $jsonData = $request->getContent();

        // Deserializar JSON directamente a un Contact
        try {
            $contact = $serializer->deserialize($jsonData, Contact::class, 'json', [
                AbstractNormalizer::GROUPS => 'contact:write',
                AbstractNormalizer::ALLOW_EXTRA_ATTRIBUTES => false,
            ]);
        } catch (ExtraAttributesException $e) {
            return $this->json([
                'errors' => [
                    'message' => [$e->getMessage()]
                ]
            ], Response::HTTP_BAD_REQUEST);
        }

        
        $errors = $validator->validate($contact);
        if (count($errors) > 0) {
            $messages = [];
            foreach ($errors as $error) {
                $property = $error->getPropertyPath();
                $messages[$property][] = $error->getMessage();
            }
            return $this->json(['errors' => $messages], Response::HTTP_BAD_REQUEST);
        }

        // Verificar si ya existe un contacto con este email
        $existing = $em->getRepository(Contact::class)->findOneBy(['email' =>$contact->getEmail()]);
        if ($existing) {
            return $this->json([
                'errors' => [
                    'message' => ['A contact with this email already exists']
                ]
            ], Response::HTTP_CONFLICT);
        }

        $em->persist($contact);
        $em->flush();
        
        $data = $serializer->serialize(['message' => 'Contact created successfully', 'contact' => $contact], 'json', [AbstractNormalizer::GROUPS => 'contact:read']);
        return new JsonResponse($data, JsonResponse::HTTP_CREATED, [], true);
    }

    #[Route('/api/contacts/{id}', name: 'update', methods: ['PUT'])]
    public function update(int $id, Request $request, EntityManagerInterface $em, ValidatorInterface $validator, SerializerInterface $serializer): JsonResponse
    {
        $contact = $em->getRepository(Contact::class)->find($id);

        if (!$contact) {
            return $this->json([
                'errors' => [
                    'message' => ['Contact not found']
                ]
            ], Response::HTTP_NOT_FOUND);
        }

        if (!$contact->isActive()) {
            return $this->json([
                'errors' => [
                    'message' => ['This contact has been deleted and cannot be updated.']
                ]
            ], JsonResponse::HTTP_FORBIDDEN);
        }

        $jsonData = $request->getContent();

        // Deserializar JSON directamente a un Contact
        try {
            $contact = $serializer->deserialize($jsonData, Contact::class, 'json', [
                AbstractNormalizer::OBJECT_TO_POPULATE => $contact,
                AbstractNormalizer::GROUPS => 'contact:write',
                AbstractNormalizer::ALLOW_EXTRA_ATTRIBUTES => false,
            ]);
        } catch (ExtraAttributesException $e) {
            return $this->json([
                'errors' => [
                    'message' => [$e->getMessage()]
                ]
            ], Response::HTTP_BAD_REQUEST);
        }

        // Validación: email único
        if ($contact->getEmail()) {
            $existing = $em->getRepository(Contact::class)->findOneBy(['email' => $contact->getEmail()]);
            if ($existing && $existing->getId() !== $contact->getId()) {
                return $this->json([
                    'errors' => [
                        'message' => ['A contact with this email already exists']
                    ]
                ], Response::HTTP_CONFLICT);
            }
        }

        $errors = $validator->validate($contact);
        if (count($errors) > 0) {
            $messages = [];
            foreach ($errors as $error) {
                $property = $error->getPropertyPath();
                $messages[$property][] = $error->getMessage();
            }
            return $this->json(['errors' => $messages], Response::HTTP_BAD_REQUEST);
        }

        $contact->setUpdatedAt(new DateTimeImmutable());
        $em->flush();

        $data = $serializer->serialize(['message' => 'Contact updated successfully', 'contact' => $contact], 'json', [AbstractNormalizer::GROUPS => 'contact:read']);
        return new JsonResponse($data, JsonResponse::HTTP_OK, [], true);
    }

    #[Route('/api/contacts/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(int $id, EntityManagerInterface $em, SerializerInterface $serializer): JsonResponse
    {
        $contact = $em->getRepository(Contact::class)->find($id);

        if (!$contact) {
            return $this->json([
                'errors' => [
                    'message' => ['Contact not found']
                ]
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        if (!$contact->isActive()) {
            return $this->json([
                'errors' => [
                    'message' => ['This contact has already been deleted']
                ]
            ], JsonResponse::HTTP_FORBIDDEN);
        }

        // Eliminación lógica
        $contact->setActive(false);
        $contact->setUpdatedAt(new \DateTimeImmutable());

        $em->flush();

        $data = $serializer->serialize(['message' => 'Contact deleted successfully', 'contact' => $contact], 'json', [AbstractNormalizer::GROUPS => 'contact:read']);
        return new JsonResponse($data, JsonResponse::HTTP_OK, [], true);
    }
}
