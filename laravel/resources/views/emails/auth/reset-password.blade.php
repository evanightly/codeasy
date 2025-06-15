<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - {{ config('app.name') }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 40px 20px;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            position: relative;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
            opacity: 0.3;
        }

        .logo {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }

        .header-subtitle {
            font-size: 16px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }

        .content {
            padding: 40px 30px;
        }

        .icon-container {
            text-align: center;
            margin-bottom: 30px;
        }

        .lock-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
        }

        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 20px;
            text-align: center;
        }

        .message {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 30px;
            text-align: center;
            line-height: 1.6;
        }

        .button-container {
            text-align: center;
            margin: 40px 0;
        }

        .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .reset-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
        }

        .alternative-text {
            font-size: 14px;
            color: #718096;
            margin-top: 30px;
            padding: 20px;
            background: #f7fafc;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }

        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }

        .footer-text {
            font-size: 14px;
            color: #718096;
            margin-bottom: 10px;
        }

        .footer-links {
            font-size: 12px;
            color: #a0aec0;
        }

        .footer-links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 10px;
        }

        .expiry-notice {
            background: #fff5cd;
            border: 1px solid #f6e05e;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #744210;
        }

        .security-tip {
            background: #e6fffa;
            border: 1px solid #38b2ac;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #234e52;
        }

        @media (max-width: 600px) {
            body {
                padding: 20px 10px;
            }
            
            .email-container {
                border-radius: 15px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .logo {
                font-size: 28px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .greeting {
                font-size: 22px;
            }
            
            .reset-button {
                padding: 14px 28px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">{{ config('app.name') }}</div>
            <div class="header-subtitle">Secure Learning Platform</div>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Icon -->
            <div class="icon-container">
                <div class="lock-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 1C14.7614 1 17 3.23858 17 6V7H18C19.1046 7 20 7.89543 20 9V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V9C4 7.89543 4.89543 7 6 7H7V6C7 3.23858 9.23858 1 12 1ZM18 9H6V19H18V9ZM12 12C12.5523 12 13 12.4477 13 13V16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16V13C11 12.4477 11.4477 12 12 12ZM12 3C10.3431 3 9 4.34315 9 6V7H15V6C15 4.34315 13.6569 3 12 3Z" fill="white"/>
                    </svg>
                </div>
            </div>

            <!-- Greeting -->
            <div class="greeting">Reset Your Password</div>

            <!-- Message -->
            <div class="message">
                We received a request to reset your password for your {{ config('app.name') }} account. 
                Click the button below to securely reset your password and regain access to your learning dashboard.
            </div>

            <!-- Expiry Notice -->
            <div class="expiry-notice">
                <strong>⏰ Time Sensitive:</strong> This password reset link will expire in 60 minutes for your security.
            </div>

            <!-- Reset Button -->
            <div class="button-container">
                <a href="{{ $actionUrl }}" class="reset-button">
                    Reset My Password
                </a>
            </div>

            <!-- Alternative Text -->
            <div class="alternative-text">
                <strong>Having trouble with the button?</strong><br>
                Copy and paste the following link into your browser:<br>
                <a href="{{ $actionUrl }}" style="color: #667eea; word-break: break-all;">{{ $actionUrl }}</a>
            </div>

            <!-- Security Tip -->
            <div class="security-tip">
                <strong>🔒 Security Tip:</strong> If you didn't request this password reset, please ignore this email. 
                Your account remains secure and no changes have been made.
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                This email was sent by {{ config('app.name') }} Learning Platform
            </div>
            <div class="footer-links">
                <a href="{{ config('app.url') }}">Visit Website</a> |
                <a href="{{ config('app.url') }}/support">Support</a> |
                <a href="{{ config('app.url') }}/privacy">Privacy Policy</a>
            </div>
        </div>
    </div>
</body>
</html>
