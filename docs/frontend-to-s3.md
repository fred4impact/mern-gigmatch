# Deploying React Frontend to AWS S3

You can deploy your React frontend as a static website using AWS S3. This guide walks you through the process step by step.

---

## 1. Build Your React App

In your `frontend/` directory, run:

```sh
cd frontend
npm run build
```

This creates a `build/` folder with static files (HTML, JS, CSS, etc.).

---

## 2. Create and Configure S3 Bucket

- Go to the AWS S3 console.
- Create a new bucket (e.g., `gigmatch-frontend`).
- Enable static website hosting in the bucket properties.
- Set:
  - **Index document**: `index.html`
  - **Error document**: `index.html` (for React Router support)

---

## 3. Upload Files

- Upload all files from `frontend/build/` to the root of your S3 bucket (not the `build/` folder itself, just its contents).

---

## 4. Set Permissions

- Go to the **Permissions** tab of your bucket.
- Add a bucket policy to allow public read access (if you want a public site):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::gigmatch-frontend/*"
    }
  ]
}
```
- Replace `gigmatch-frontend` with your actual bucket name.

---

## 5. Access Your Site

- Use the S3 static website endpoint (shown in the bucket properties) to access your deployed site.
- (Optional) Set up a custom domain and SSL with CloudFront and Route 53.

---

## Why Use S3 for React Frontend?

- **Cheap**: Only pay for storage and bandwidth.
- **Scalable**: S3 + CloudFront can handle huge traffic.
- **Simple**: No server to manage for static files.

---

## (Optional) Automate Upload with AWS CLI

You can use the AWS CLI to upload your build folder:

```sh
aws s3 sync build/ s3://your-bucket-name --delete
```

---

## (Optional) Set Up CloudFront and Custom Domain

- Create a CloudFront distribution with your S3 bucket as the origin.
- Set up an SSL certificate (AWS Certificate Manager).
- Point your domain to CloudFront using Route 53.

---

For more details, see the [AWS S3 Static Website Hosting documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html). 