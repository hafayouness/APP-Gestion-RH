<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends Notification
{
    public $url;

    /**
     * Crée une nouvelle instance de notification.
     *
     * @param string $url
     */
    public function __construct($url)
    {
        $this->url = $url;
    }

    /**
     * Détermine les canaux de notification.
     *
     * @param mixed $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Crée le message d'email.
     *
     * @param mixed $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Réinitialisation de mot de passe')
            ->line('Vous avez demandé une réinitialisation de mot de passe.')
            ->action('Réinitialiser le mot de passe', $this->url)
            ->line('Si vous n\'avez pas demandé cette réinitialisation, aucune action n\'est requise.');
    }
}
