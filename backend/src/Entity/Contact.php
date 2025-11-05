<?php

namespace App\Entity;

use App\Repository\ContactRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;
use \DateTimeImmutable;

#[ORM\Entity(repositoryClass: ContactRepository::class)]
#[ORM\Table(name: 'contact')]
#[ORM\HasLifecycleCallbacks]
class Contact
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['contact:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: 'El Nombre no puede estar vacío')]
    #[Assert\Length(min: 2, max: 255, minMessage: 'El Nombre debe tener al menos 2 caracteres', maxMessage: 'El nombre no puede exceder 255 caracteres')]
    #[Groups(['contact:read', 'contact:write'])]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Length(max: 255, maxMessage: 'El Apellido no puede exceder 255 caracteres')]
    #[Groups(['contact:read', 'contact:write'])]
    private ?string $lastname = null;

    #[ORM\Column(length: 255, unique: true)]
    #[Assert\NotBlank(message: 'El Email no puede estar vacío')]
    #[Assert\Email(message: 'El Email "{{ value }}" no es un email válido.')]
    #[Groups(['contact:read', 'contact:write'])]
    private ?string $email = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Length(max: 255, maxMessage: 'El Teléfono no puede exceder 255 caracteres')]
    #[Assert\Regex(
        pattern: '/^\+[1-9]\d{1,14}$/',
        message: 'El número de teléfono debe estar en formato internacional (ejemplo: +56987654321).'
    )]
    #[Groups(['contact:read', 'contact:write'])]
    private ?string $phone = null;

    #[ORM\Column(type: Types::BOOLEAN)]
    #[Groups(['contact:read'])]
    private ?bool $active = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['contact:read'])]
    private ?DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['contact:read'])]
    private ?DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->active = true;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getLastname(): ?string
    {
        return $this->lastname;
    }

    public function setLastname(?string $lastname): static
    {
        $this->lastname = $lastname;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(?string $phone): static
    {
        $this->phone = $phone;

        return $this;
    }

    public function isActive(): ?bool
    {
        return $this->active;
    }

    public function setActive(bool $active): static
    {
        $this->active = $active;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }


    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }
}
