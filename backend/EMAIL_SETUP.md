# Email Setup for Password Reset

To enable password reset functionality, you need to configure email settings in your `.env` file.

## Required Environment Variables

Add these to your `backend/.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@gigmatch.com

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:3000
```

## Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `SMTP_PASS`

## Alternative Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

### Custom SMTP Server
```env
SMTP_HOST=your_smtp_server.com
SMTP_PORT=587
SMTP_USER=your_username
SMTP_PASS=your_password
```

## Testing

1. Start your backend server
2. Go to `/forgot-password` on your frontend
3. Enter a valid email address
4. Check the email inbox for the reset link

## Security Notes

- Reset tokens expire after 10 minutes
- Tokens are hashed before storing in database
- Use environment variables for sensitive data
- Consider using a dedicated email service (SendGrid, Mailgun) for production 