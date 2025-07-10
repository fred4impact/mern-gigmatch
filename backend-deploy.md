# Deploying Backend (Node.js/Express) on AWS EC2 (3-Tier Architecture)

This guide covers deploying your backend API to an EC2 instance in a secure, production-ready 3-tier AWS infrastructure (private subnet, IAM, security groups).

---

## 1. Prerequisites
- EC2 instance (Amazon Linux 2 or Ubuntu recommended) in a **private subnet**
- IAM role attached to EC2 (for S3, CloudWatch, etc. access if needed)
- Security group allowing only necessary inbound/outbound traffic (e.g., allow 5000/tcp from ALB or bastion)
- SSH access via bastion or SSM Session Manager
- MongoDB connection string (to AWS DocumentDB, Atlas, or a managed instance)

---

## 2. Connect to Your EC2 Instance

Via SSH (from bastion or SSM):
```sh
ssh ec2-user@<EC2_PRIVATE_IP>
```

---

## 3. Install Required Tools

### Update packages
```sh
sudo yum update -y   # Amazon Linux
# or
sudo apt update && sudo apt upgrade -y   # Ubuntu
```

### Install Node.js (LTS)
```sh
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -   # Amazon Linux
sudo yum install -y nodejs
# or
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -   # Ubuntu
sudo apt-get install -y nodejs
```

### Install PM2 (process manager)
```sh
sudo npm install -g pm2
```

### Install Git
```sh
sudo yum install -y git   # Amazon Linux
# or
sudo apt-get install -y git   # Ubuntu
```

### Install MongoDB Shell (mongosh)
See: https://www.mongodb.com/docs/mongodb-shell/install/
```sh
# Example for Amazon Linux 2
curl -o mongosh.rpm https://downloads.mongodb.com/compass/mongosh-2.2.4.x86_64.rpm
sudo yum install -y ./mongosh.rpm

# Example for Ubuntu
wget https://downloads.mongodb.com/compass/mongosh_2.2.4_amd64.deb
sudo dpkg -i mongosh_2.2.4_amd64.deb
```

---

## 4. Clone Your Backend Repository
```sh
cd ~
git clone <YOUR_REPO_URL>
cd <YOUR_PROJECT_DIR>/backend
```

---

## 5. Install Backend Dependencies
```sh
npm install --production
```

---

## 6. Set Environment Variables
Create a `.env` file or export variables as needed:
```sh
echo "MONGO_URI=<your-mongo-uri>\nNODE_ENV=production\nPORT=5000" > .env
```
Or use AWS SSM Parameter Store/Secrets Manager for sensitive values.

---

## 7. Start the Backend with PM2
```sh
pm2 start server.js --name gigmatch-backend
pm2 save
pm2 startup
```

---

## 8. Security Best Practices
- **Run in private subnet**; expose only via ALB or API Gateway.
- **IAM role**: Attach least-privilege role for AWS resources.
- **Security groups**: Restrict inbound to ALB/bastion, outbound to DB only.
- **No hardcoded secrets**: Use SSM/Secrets Manager for environment variables.
- **Enable CloudWatch Logs** for monitoring (PM2 can be configured to forward logs).

---

## 9. (Optional) Update & Redeploy
```sh
cd <YOUR_PROJECT_DIR>/backend
git pull
npm install --production
pm2 restart gigmatch-backend
```

---

## 10. Recommended IAM Roles & SSM Integration

### IAM Role for EC2 Backend Instance
Attach an IAM role to your EC2 instance with the following managed policies (or a custom policy with least privilege):

- **AmazonSSMManagedInstanceCore** (for SSM Session Manager access)
- **CloudWatchAgentServerPolicy** (for CloudWatch Logs, if using)
- **AmazonS3ReadOnlyAccess** (if your app needs to read from S3)
- **Custom policy** for Parameter Store/Secrets Manager (for environment variables)

#### Example Custom Policy for SSM Parameter Store/Secrets Manager
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath"
      ],
      "Resource": "arn:aws:ssm:<region>:<account-id>:parameter/<your-app-prefix>/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:<region>:<account-id>:secret:<your-secret-prefix>*"
    }
  ]
}
```
- Replace `<region>`, `<account-id>`, `<your-app-prefix>`, and `<your-secret-prefix>` as appropriate.

---

### Setting Up SSM Agent on EC2
- **Amazon Linux 2** and **Ubuntu 20.04+** come with SSM Agent pre-installed. If not, install it:

#### Amazon Linux 2
```sh
sudo yum install -y amazon-ssm-agent
sudo systemctl enable amazon-ssm-agent
sudo systemctl start amazon-ssm-agent
```

#### Ubuntu
```sh
sudo snap install amazon-ssm-agent --classic
sudo systemctl enable snap.amazon-ssm-agent.amazon-ssm-agent.service
sudo systemctl start snap.amazon-ssm-agent.amazon-ssm-agent.service
```

---

### Using SSM Parameter Store for Environment Variables
Store sensitive environment variables in SSM Parameter Store:

```sh
aws ssm put-parameter --name "/gigmatch/MONGO_URI" --value "<your-mongo-uri>" --type "SecureString"
```

Retrieve in your deployment script or app:
```sh
MONGO_URI=$(aws ssm get-parameter --name "/gigmatch/MONGO_URI" --with-decryption --query "Parameter.Value" --output text)
export MONGO_URI
```

---

### Using SSM Session Manager for Secure SSH-less Access
- Use the AWS Console or CLI:
```sh
aws ssm start-session --target <instance-id>
```
- No need to open SSH ports in your security group!

---

**References:**
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [SSM Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)
- [Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html)

---

## References
- [PM2 Docs](https://pm2.keymetrics.io/)
- [AWS EC2 Best Practices](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/best-practices.html)
- [MongoDB Shell Install](https://www.mongodb.com/docs/mongodb-shell/install/) 