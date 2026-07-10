using System.Net;
using System.Net.Mail;
using MedicalAI.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace MedicalAI.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        // 1. Log to console / terminal for local debugging / testing
        var divider = new string('=', 60);
        Console.WriteLine(divider);
        Console.WriteLine($"[EMAIL SENT TO: {toEmail}]");
        Console.WriteLine($"Subject: {subject}");
        Console.WriteLine($"Body:\n{body}");
        Console.WriteLine(divider);

        _logger.LogInformation("Attempting to send email to {ToEmail} with subject '{Subject}'", toEmail, subject);

        // 2. Try sending real email using SmtpClient
        try
        {
            var smtpServer = _configuration["EmailSettings:SmtpServer"] ?? "smtp.gmail.com";
            var portStr = _configuration["EmailSettings:Port"] ?? "587";
            int port = int.TryParse(portStr, out var p) ? p : 587;
            var senderEmail = _configuration["EmailSettings:SenderEmail"] ?? "";
            var senderName = _configuration["EmailSettings:SenderName"] ?? "Medical AI System";
            var username = _configuration["EmailSettings:Username"] ?? "";
            var password = _configuration["EmailSettings:Password"] ?? "";
            var enableSslStr = _configuration["EmailSettings:EnableSsl"] ?? "true";
            bool enableSsl = !bool.TryParse(enableSslStr, out var ssl) || ssl;

            if (string.IsNullOrEmpty(senderEmail) || string.IsNullOrEmpty(password))
            {
                _logger.LogWarning("Email settings (SenderEmail or Password) are not configured. Real email sending skipped.");
                return;
            }

            using var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail, senderName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            mailMessage.To.Add(toEmail);

            using var smtpClient = new SmtpClient(smtpServer, port)
            {
                Credentials = new NetworkCredential(username, password),
                EnableSsl = enableSsl
            };

            await smtpClient.SendMailAsync(mailMessage);
            _logger.LogInformation("Email sent successfully via SMTP.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email via SMTP. Please check appsettings.json config.");
        }
    }
}
