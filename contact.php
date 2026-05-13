<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $message = trim($_POST['message'] ?? '');
    // die("ok");
    // Validation
    if (empty($name) || empty($email) || empty($message)) {
        die("All fields are required.");
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die("Invalid email format.");
    }

    $mail = new PHPMailer(true);

    try {

        // SMTP Configuration
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;

        // Your Gmail Address
        $mail->Username   = 'mohdrihan6314@gmail.com';

        // Gmail App Password
        $mail->Password   = 'pisofcvaujgeoywb';

        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // Sender & Receiver
        $mail->setFrom('mohdrihan6314@gmail.com', 'Portfolio Website');
        $mail->addAddress('mohdrihan6314@gmail.com');

        // Reply To User
        $mail->addReplyTo($email, $name);

        // Email Content
        $mail->isHTML(true);
        $mail->Subject = 'Portfolio Contact Form Message';

        $mail->Body = "
            <h3>New Contact Form Message</h3>

            <p><strong>Name:</strong> {$name}</p>

            <p><strong>Email:</strong> {$email}</p>

            <p><strong>Message:</strong><br>{$message}</p>
        ";

        $mail->send();

        header("Location: index.html?success=1");
        exit;

    } catch (Exception $e) {

        echo "Mailer Error: " . $mail->ErrorInfo;

    }
}
?>