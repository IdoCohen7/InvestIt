using System;
using System.IO;
using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace InvestItAPI.Tools
{
    public class EmailService
    {
        public void SendEmail(string toEmail, string subject, string body)
        {
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory()) 
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .Build();

            var fromEmail = configuration["EmailSettings:FromEmail"];
            var password = configuration["EmailSettings:AppPassword"];



            var smtpClient = new SmtpClient("smtp.gmail.com")
            
            {
                Port = 587,
                Credentials = new NetworkCredential(fromEmail, password),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail, "InvestIt Support"),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mailMessage.To.Add(toEmail);
            smtpClient.Send(mailMessage);
            Console.WriteLine("Email sent successfully!");
        }
    }
}
