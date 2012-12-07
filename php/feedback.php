<?php
    // Set mailing parameters
    ini_set("SMTP","meckexchevs01.co.mecklenburg.nc.us");
    ini_set("smtp_port","25");
    ini_set("sendmail_from","noreply@mecklenburgcountync.gov");

    // Get referrer and browser arguments
    $browser = get_browser(null, true);

    // Get post arguments
    $name = trim($_REQUEST['inputName']);
    $email = trim($_REQUEST['inputEmail']);
    $url = trim($_REQUEST['inputURL']);
    $comment = trim($_REQUEST['inputFeedback']);

    $to = "tobin.bradley@mecklenburgcountync.gov";
    $subject = "QOL Dashboard Feedback";

    $message = "From: " . $name . " <" . $email . ">\n";
    $message .= "URL: " . $url . "\n";
    $message .= "OS: " . $browser["platform"] . "\n";
    $message .= "Browser: " . $browser["parent"] . "\n\n\n";
    $message .= $comment;

    // Send the mail
    mail($to, $subject, $message, $headers);

?>
